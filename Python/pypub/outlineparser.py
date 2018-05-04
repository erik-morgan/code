import re
from lxml import etree

############################################################
# TODO: Add support for roman numeral volume numbers
# REQUIRES PROJECT: TO BE ITS OWN LINE
# CONSIDER IGNORING REVS BC IT SHOULD USE MAIN LIBRARY &
# THERE ARE CONSTANT TYPOS, BUT IT WOULD REQUIRE NEW TOCS EVERY TIME
# Use 2-digit revs, even for nc (00)?; return else '00' for NC in future in _rev_repl function
# standardize drawing descriptions and attach as metadata to drawing library files

############################################################

class OutlineParser:
    def __init__(self, xdoc):
        if isinstance(xdoc, bytes):
            xdoc = xdoc.decode()
        xdoc = re.sub(r'\b[rw]:| xmlns[^>]+| encoding=\S+', '', xdoc)
        self.doc = etree.fromstring(xdoc)[0]
        self.get_props()
        self.sections = list(self.get_sections())
        self.doc_list = []

    def get_sections(self):
        for para in self.doc.iter('p'):
            if list(para.iter('strike')):
                continue
            if all(list(para.iter(tag)) for tag in 'ubt'):
                if not sect[0][0:5] in 'TABLE INTRO':
                    yield sect
                sect = [self.get_text(para)]
            elif sect:
                sect.append(self.get_text(para))
        yield sect
    
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
    
    def add_sect(self, sect):
        if not sect[1]:
            title = re.sub(r' PHASE| PROCEDURES?|[\t].*)', '', sect[0])
            self._phase = self.subel(self.xpub, 'phase', {'title': title})
        else:
            self._unit = self.subel(self._phase, 'unit', {'title': sect[0]})
            self.parse_sect([s for s in sect if len(sect)])
    
    def parse_sect(self, sections):
        sect_bs = 'bluesheet' in sections.pop(0).lower()
        for par in sections:
            if re.search(r'\d{5}', par):
                self._add_draw(par.split('\t'))
            elif re.match(r'[A-Z]{2,6}\d{4}|BTC ?\d\d', par):
                par = par.replace('BTC ', 'BTC')
                text = '\n'.join(sections).lower()
                rev = re.sub(r'(?s)(.+\brev ?(\d+))?.*', r'\2', text)
                self._add_proc(par, rev, sect_bs, 'advisory' in text)
            sections.remove(par):
    
    def _add_draw(self, tsplit):
        draw = {'id': tsplit[0]}
        if self.draft and 'bluesheet' in para.lower():
            draw['bs'] = 'True'
        else:
            self.doc_list.append(tsplit[0])
        draw = subel(self._unit, 'dw', draw)
        draw.text = tsplit[1]
    
    def _add_proc(self, text, rev, sect_bs, adv):
        proc = {
            'id': '-'.join(re.split(r'\W', text.split()[0])),
            'rev': rev,
        }
        if adv:
            proc['advisory'] = 'True'
        if sect_bs or 'bluesheet' in text.lower():
            proc['bs'] = 'True'
        else:
            self.doc_list.append(proc['id'] + (f'.R{rev}' if rev else ''))
        subel(self._unit, 'rp', proc)
    
    def subel(self, parent, name, attrs={}):
        return etree.SubElement(parent, name, attrs)