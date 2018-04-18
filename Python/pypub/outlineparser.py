import re
from lxml import etree

class OutlineParser:
    def __init__(self, xdoc):
        self.ns = {
            'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        }
        self.doc = etree.fromstring(re.sub(r'<w:(tab|br)/>', '<w:t>\t</w:t>', xdoc))[0]
        for node in self.doc.xpath('//w:p[./w:pPr//w:strike]', namespaces=xns):
            self.doc.remove(node)
        self.init_regx()
    
    def parse(self):
        # TODO: Add support for roman numeral volume numbers
        # REQUIRES PROJECT: TO BE ITS OWN LINE
        # CONSIDER IGNORING REVS BC IT SHOULD USE MAIN LIBRARY &
        # THERE ARE CONSTANT TYPOS, BUT IT WOULD REQUIRE NEW TOCS EVERY TIME
        self.ptext = [''.join(t for t in p.itertext()) for p in self.doc]
        props = self.get_props(*self.ptext[0:5])
        self.xpub = etree.Element('project', props)
        xsect = '//w:p[not(./w:pPr//w:strike) and .//w:u and .//w:b and position() > 2]'
        self.sections = self.doc.xpath(xsect, namespaces=xns)
        for index, sect in enumerate(sections):
            doc_index = self.doc.index(sect)
            pdata = self.ptext[doc_index]
            if not self.ptext[doc_index + 1]:
                self.add_phase(pdata)
                continue
            else:
                self.add_unit(pdata)
            next_doc_index = self.doc.index(sections[index + 1])
            self.parse_sect(self.ptext[doc_index + 1:next_doc_index])
        return self.xpub
    
    def init_regx(self):
        self.regx = {
            'split': re.compile(r'\t+'),
            'draw': re.compile(r'[-0-9]{6}', re.I),
            'proc': re.compile(r'^([A-Z]{2,6}\d{4}\S*|BTC ?\d\d)'),
            'phase': re.compile(r' PHASE| PROCEDURES?|[\t].*)')
        }
    
    def get_props(self, sys, cust, proj, rig, sm):
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
        return props
    
    def parse_sect(self, pdata):
        for para in pdata:
            if not para:
                continue
            tsplit = self.regx['split'].split(para)
            if self.regx['draw'].match(para):
                self._add_draw(para, tsplit)
            elif self.regx['proc'].match(para):
                self._add_proc(para)
            elif tsplit[0].beginswith('Rev'):
                self._proc.set('rev', tsplit[0][-2:])
            elif 'ADVISORY' in para:
                self._proc.set('advisory', 'True')
    
    def add_phase(self, phase_text):
        title = self.regx['phase'].sub('', phase_text)
        self._phase = etree.SubElement(self.xpub, 'phase', title=title)
    
    def add_unit(self, unit_text):
        self._unit = etree.SubElement(self._phase, 'unit')
        if unit_text.beginswith('STACK-UP'):
            unit.set('title', 'Stack-Up and Sequence Drawings')
        elif unit_text.beginswith('CONDUCTOR'):
            unit.set('title', 'Conductor')
        elif 'TEST OPTION' in unit_text:
            unit.set('title', 'BOP Test Options')
    
    def format_id(self, data):
        data = data.replace('/', '-')
        return data.replace(' ', '')
    
    def _add_draw(self, para, tsplit):
        draw = etree.SubElement(self._unit, 'drawing', id=self.format_id(tsplit[0]))
        draw.text = tsplit[1]
        if self.draft and 'bluesheet' in para.lower():
            draw.set('bs', 'True')
    
    def _add_proc(self, para):
        procid = self.regx['proc'].match(para)[0]
        self._proc = etree.SubElement(self._unit, 'procedure', id=self.format_id(procid))
        if self.draft and 'bluesheet' in para.lower():
            self._proc.set('bs', 'True')
    