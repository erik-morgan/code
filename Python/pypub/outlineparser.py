import re
from lxml import etree

############################################################
# TODO: Add support for roman numeral volume numbers
# REQUIRES PROJECT: TO BE ITS OWN LINE
# CONSIDER IGNORING REVS BC IT SHOULD USE MAIN LIBRARY &
# THERE ARE CONSTANT TYPOS, BUT IT WOULD REQUIRE NEW TOCS EVERY TIME
# Use 2-digit revs, even for nc (00)?; return else '00' for NC in future in _rev_repl function
# standardize drawing descriptions and attach as metadata to drawing library files
# make sure deleting all strikes is okay; what if only a side note is strike-thru?

# From add_unit
#        if unit_text.beginswith('STACK-UP'):
#            unit.set('title', 'Stack-Up and Sequence Drawings')
#        elif unit_text.beginswith('CONDUCTOR'):
#            unit.set('title', 'Conductor')
#        elif 'BOP TEST OPT' in unit_text:
#            unit.set('title', 'BOP Test Options')
############################################################

class OutlineParser:
    def __init__(self, xdoc):
        xdoc = re.sub(r'\b[rw]:| xmlns[^>]+', '', xdoc)
        self.doc = etree.fromstring(xdoc)[0]
        self.get_props()
        self.sections = []
        
    def get_sections(self):
        for para in self.doc.iter('p'):
            if para.find('strike'):
                self.doc.remove(para)
                continue
            if all(para.find(tag) for tag in 'ubt'):
                self.sections.append(list(self.gen_paras(para)))
        self.num_sects = len(self.sections)
    
    def gen_paras(self, sect_para):
        yield sect_para
        for para in sect_para.itersiblings('r'):
            if all(para.find(tag) for tag in 'ubt'):
                break
            yield para
    
    def get_props(self):
        sys, cust, proj, rig, sm = [self.get_text(p) for p in self.doc[0:5]]
        props = {
            'sys': sys.split('\t')[0],
            'cust': cust.split(': ', 1)[-1],
            'proj': proj.split(': ', 1)[-1],
            'rig': rig.split(': ')[-1],
        }
        sm = sm.split(': ')[-1].lower()
        smparts = sm.split()
        props['sm'] = smparts[0]
        if 'vol' in sm:
            i = smparts.index('volume')
            props['vol'] = smparts[i + 1]
        if 'rev' in sm:
            i = smparts.index('rev')
            props['rev'] = smparts[i + 1]
        self.draft = props['draft'] = 'draft' in sm.lower()
        self.xpub = etree.Element('project', props)
    
    def get_text(self, para):
        for node in para.iter('t', 'tab', 'br'):
            if node.tag == 'br':
                break
            if node.tag == 't':
                para_text = (para_text or '') + node.text
            elif node.tag == 'tab' and para_text[-1] != '\t':
                para_text = para_text.strip() + '\t'
        return para_text.strip() if para_text else ''
    
    def add_sect(self, sect_text, isect):
        next_text = self.get_text(self.doc[isect + 1])
        if not next_text:
            title = re.sub(r' PHASE| PROCEDURES?|[\t].*)', '', phase_text)
            parent, name, title = (self.xpub, 'phase', {'title': title})
        else:
            title = 'Stack-Up and Sequence Drawings' if 'STACK-UP' in unit_text else 'NODE_TITLE'
            parent, name, title = (self._phase, 'unit', {'title': title})
        setattr(self, f'_{name}', self.subel(parent, name, title))
    
############################################################
#     review this and rx functions; work out way to do draw/proc without regex
############################################################
    def parse_sect(self, ithis, inext=-1):
        sect_text = [self.get_text(p) for p in self.doc[ithis:inext]]
        for text in sect_text:
            if not text:
                continue
            len(list(filter(str.isdigit, str(p.name))))
            if [text.split()[0]]
            if self.rx['draw'].match(text):
                self._add_draw(text.split('\t'))
            elif self.rx['proc'].match(text):
                self._add_proc(text, '\n'.join(sect_text))
############################################################
    
    def _add_draw(self, tsplit):
        draw = {'id': self.format_id(tsplit[0])}
        if self.draft and 'bluesheet' in para.lower():
            draw['bs'] = 'True'
        draw = subel(self._unit, 'drawing', draw)
        draw.text = tsplit[1]
    
    def _add_proc(self, text, sect_text):
        proc = {
            'id': self.format_id(self.rx['proc'].match(text)[0]),
        }
        if 'Rev' in sect_text:
            rev = sect_text.split('Rev ')[1][0:2]
        rev = self.rx['rev'].sub(self._rev_repl, sect_text)
        if rev:
            proc['rev'] = rev[-2:]
        proc['filename'] = proc['id'] + rev
        if 'advisory' in sect_text.lower():
            proc['advisory'] = 'True'
        if self.draft and 'bluesheet' in para.lower():
            proc['bs'] = 'True'
        etree.SubElement(self._unit, 'procedure', proc)
    
    def _rev_repl(self, match_obj):
        return '.R' + (match_obj[1] if match_obj[1].isdigit() else '')
    
    def subel(self, parent, name, attrs={}):
        return etree.SubElement(parent, name, attrs)
    
    def format_id(self, data):
        data = data.replace('/', '-')
        return data.replace(' ', '')
    
    def init_regx(self):
        self.rx = {}
        # self.rx['draw'] = find manual way to check if there are 5+ numbers in text.split()[0]
        self.rx['proc'] = re.match(r'^([A-Z]{2,6}\d{4}\S*|BTC ?\d\d)')
    
# [self.build_sect(par) for i, par in enumerate(self.doc) if all(para.find(tag) for tag in 'ubt')]
# def build_sect(self, para):
#     sect = [self.get_text(para)]
#     while para and not all(para.getnext().find(tag) for tag in 'ubt'):
#         sect.append(para.getnext())
#         para = para.getnext()
#     return sect
# 
# def get_sections(self):
#     for para in self.doc.iter('p'):
#         if para.find('strike'):
#             self.doc.remove(para)
#             continue
#         text = self.get_text(para)
#         if all(para.find(tag) for tag in 'ubt'):
#             self.sections.append([text])
#         else:
#             self.sections[-1].append(text)
#     return len(self.sections)

