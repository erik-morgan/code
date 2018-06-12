from zipfile import ZipFile
import re
from lxml import etree

############################################################
# REQUIRES PROJECT TO BE ITS OWN LINE
# CONSIDER: USE MAIN LIB & IGNORE REVS/TYPOS (NO SAVING TOCS)
# Use 2-digit revs, even for nc (00)?; return else '00' for NC in future in _rev_repl function
# standardize drawing descriptions and attach as metadata to drawing library files
# was going to convert volume ints to roman numerals, but user needs to use correct, desired format
# forbid "section" bluesheets; put the bluesheet next to the actual document

# ideally, figure out a more reliable way to remove namespaces
# have to do styles bc of strikethru
############################################################

class OutlineParser:
    def __init__(self, outline):
        with ZipFile(outline) as zip:
            xdoc = zip.open('word/document.xml').read().decode()
            xstyles = zip.open('word/styles.xml').read().decode()
        xdoc = self.loadStyles(xdoc, xstyles)
        self.doc = etree.fromstring(xdoc)[0]
    
    def loadStyles(self, xdoc, xstyles):
        xstyles = re.sub(r'\b(r|w[a-z0-9]*):(?! )| xmlns[^>]+| encoding=\S+', '', xstyles)
        xdoc = re.sub(r'\b(r|w[a-z0-9]*):(?! )| xmlns[^>]+| encoding=\S+', '', xdoc)
        sdoc = etree.fromstring(xstyles)
        for s in sdoc.iter('style'):
            sid = s.get('styleId')
            sprops = ''
            stype = 'pStyle' if s.get('type') == 'paragraph' else 'rStyle'
            for pr in s.iter('pPr', 'rPr'):
                for child in pr:
                    sprops += etree.tostring(child).decode()
            xdoc = xdoc.replace(f'<{stype} val="{sid}"/>', sprops)
        return xdoc
    
    def parse(self):
        self.getProps()
        phase = ''
        paragen = self.addPara()
        next(paragen)
        for para in self.doc.iter('p'):
            if list(para.iter('strike')):
                continue
            ishead = all(list(para.iter(tag)) for tag in 'ubt')
            if ishead and not list(para.getnext().iter('t')):
                phase = re.sub(r'(?i) PHASE| PROCEDURES?|\t.*', '',
                    self.getText(para))
                if 'APPENDIX' in phase.upper():
                    self.pub.set('appendix', 'True')
                if phase.upper()[0:5] not in 'TABLE INTRO APPEN':
                    etree.SubElement(self.pub, 'phase', {'title': phase})
            elif phase and phase.upper()[0:5] not in 'TABLE INTRO APPEN':
                if ishead:
                    etree.SubElement(self.pub[-1], 'unit')
                else:
                    paragen.send(self.getText(para))
    
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
        draw = {}
        if self.draft and 'bluesheet' in text.lower():
            draw['bs'] = 'True'
        text = text.split('\t', 1)
        draw['id'] = text[0].replace(' ', '')
        if any(ch.isalpha() for ch in text[0]):
            draw = etree.SubElement(self.pub[-1][-1], 'il', draw)
        else:
            draw = etree.SubElement(self.pub[-1][-1], 'dw', draw)
        if len(text) > 1:
            draw.text = text[1]
    
    def addProc(self, text):
        proc = {}
        if 'bluesheet' in text.lower():
            proc['bs'] = 'True'
        if 'rev' in text.lower() and not 'NC' in text.upper():
            proc['rev'] = re.search(r'(?i)rev (\d+)', text)(1)
        text = text.split('\t')
        if 'BTC' in text[0].upper():
            self.pub[-1][-1].set('title', 'BOP Test Options')
            proc['id'] = re.sub(r'(?i)(BTC) ?(\d+).*', r'\1\2', text[0])
        else:
            proc['id'] = re.sub(r'\W', '', text[0])
        proc = etree.SubElement(self.pub[-1][-1], 'rp', proc)
        if len(text) > 1:
            proc.text = text[1]
        return proc
    
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
                self.draft = 'draft' in prop.lower()
                props['draft'] = str(self.draft)
        self.pub = etree.Element('project', props)
    
    def getText(self, p):
        if isinstance(p, int):
            p = self.doc[p]
        paraText = ''
        for node in p.iter('t', 'tab', 'br'):
            if node.getparent().tag != 'r':
                continue
            if node.tag == 'br':
                break
            if node.tag == 't':
                paraText += node.text
            elif node.tag == 'tab' and paraText[-1] != '\t':
                paraText = paraText.strip() + '\t'
        return paraText.strip() if paraText else ''
    
