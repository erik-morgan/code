import re
from lxml import etree

############################################################
# TODO: Add support for roman numeral volume numbers
# REQUIRES PROJECT: TO BE ITS OWN LINE
# CONSIDER IGNORING REVS BC IT SHOULD USE MAIN LIBRARY &
# THERE ARE CONSTANT TYPOS, BUT IT WOULD REQUIRE NEW TOCS EVERY TIME
# Use 2-digit revs, even for nc (00)?; return else '00' for NC in future in _rev_repl function
# standardize drawing descriptions and attach as metadata to drawing library files
# was going to convert volume ints to roman numerals, but user needs to use correct, desired format
# forbid "section" bluesheets; put the bluesheet next to the actual document
#     investigate how bluesheets were denoted in that crazy outline that was missing like 6 procs
############################################################
# 
# RESUME AT ADDPROC/ADDDRAW
# 
############################################################

class OutlineParser:
    def __init__(self, xdoc):
        if isinstance(xdoc, bytes):
            xdoc = xdoc.decode()
        xdoc = re.sub(r'\b[rw]:| xmlns[^>]+| encoding=\S+', '', xdoc)
        self.doc = etree.fromstring(xdoc)[0]
    
    def parse(self):
        self.getProps()
        for para in self.doc.iter('p'):
            if list(para.iter('strike')):
                continue
            if all(list(para.iter(tag)) for tag in 'ubt'):
                self.addSect(para)
            else:
                self.addPara(self.getText(para))
    
    def getProps(self):
        props = {}
        props['sys'] = self.getText(0).split('\t')[0]
        props['cust'] = self.getText(1).split(': ', 1)[-1]
        for p in range(2, 5):
            name, prop = self.getText(p).split(': ', 1)
            if 'Project' in name or 'Rig' in name:
                props['rig' if 'Rig' in name else 'proj'] = prop
            elif 'Manual' in name:
                props['sm'] = re.search(r'\d{4}', prop)[0]
                if 'rev' in prop.lower():
                    props['rev'] = re.search(r'Rev\S* (\d+)', prop, re.I)[1]
                if 'vol' in prop.lower():
                    props['vol'] = re.search(r'Vol\S* (\S+)', prop, re.I)[1]
                self.draft = props['draft'] = 'draft' in prop.lower()
        self.pub = etree.Element('project', props)
    
    def addSect(self, sect):
        text = self.getText(sect)
        if sect[0][0:5] in 'TABLE INTRO':
            return None
        if list(sect.getnext().iter('t')):
            return etree.SubElement(self.pub[-1], 'unit', {'title': text})
        else:
            return etree.SubElement(self.pub, 'phase', {
                'title': re.sub(r' PHASE| PROCEDURES?|\t.*)', '', text)
            })
    
    def addPara(self):
        while True:
            para = yield
            if re.search(r'\d{5}', para):
                self.addDraw(para)
            elif para.lower().startswith('rev') and not 'NC' in para.upper():
                proc.set('rev', para.split()[-1])
            elif 'advisory' in para.lower():
                proc.set('advisory', 'True')
            elif re.match(r'[A-Z]{2,6} ?\d+', para):
                proc = self.addProc(para)
    
    def addDraw(self, text):
        # differentiate bw ills/draws
        draw = {'id': tsplit[0]}
        if self.draft and 'bluesheet' in para.lower():
            draw['bs'] = 'True'
        # self.docList.append(tsplit[0])
        draw = etree.SubElement(self.pub[-1][-1], 'dw', draw)
        draw.text = tsplit[1]
    
    def addProc(self, text):
        # para = para.replace('BTC ', 'BTC')
        # rev = re.sub(r'(?is)(.+\brev ?(\d+))?.*', r'\2', text)
        # CHANGE HOW ID IS PICKED; PROBABLY INSIST ON -## ONLY, NOT -MT
        # CHECK FOR INLINE REV (IE BTC)
        proc = {
            'id': '-'.join(re.split(r'\W', text.split()[0])),
        }
        if 'bluesheet' in text.lower():
            proc['bs'] = 'True'
        # self.docList.append(proc['id'] + (f'.R{rev}' if rev else ''))
        return etree.SubElement(self.pub[-1][-1], 'rp', proc)
    
    def getText(self, p):
        if isinstance(p, int):
            p = self.doc[p]
        for node in p.iter('t', 'tab', 'br'):
            if node.tag == 'br':
                break
            if node.tag == 't':
                paraText = (paraText or '') + node.text
            elif node.tag == 'tab' and paraText[-1] != '\t':
                paraText = paraText.strip() + '\t'
        return paraText.strip() if paraText else ''
    
