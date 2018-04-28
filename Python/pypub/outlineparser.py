import re
from lxml import etree

# TODO: Add support for roman numeral volume numbers
# REQUIRES PROJECT: TO BE ITS OWN LINE
# CONSIDER IGNORING REVS BC IT SHOULD USE MAIN LIBRARY &
# THERE ARE CONSTANT TYPOS, BUT IT WOULD REQUIRE NEW TOCS EVERY TIME
# Use 2-digit revs, even for nc (00)?

class OutlineParser:
    ns = {
        'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    }
    
    def __init__(self, xdoc):
        doc = re.sub(r'<w:(tab|br)/>', '<w:t>\t</w:t>', xdoc)
        self.doc = etree.fromstring(doc)[0]
        for node in self.doc.xpath('//w:p[./w:pPr//w:strike]', namespaces=xns):
            self.doc.remove(node)
        self.init_regx()
        self.init_parser()
    
    def init_regx(self):
        self.regx = {
            'split': re.compile(r'\t+'),
            'draw': re.compile(r'[-0-9]{6}', re.I),
            'proc': re.compile(r'^([A-Z]{2,6}\d{4}\S*|BTC ?\d\d)'),
            'phase': re.compile(r' PHASE| PROCEDURES?|[\t].*)')
            'rev': re.compile(r'[\S\s]*rev ([A-Z0-9]+)[\S\s]*', re.I)
        }
    
    def init_parser(self):
        self.ptext = [''.join(t for t in p.itertext()) for p in self.doc]
        props = self.get_props(*self.ptext[0:5])
        self.xpub = etree.Element('project', props)
        xsect = '//w:p[not(./w:pPr//w:strike) and .//w:u and .//w:b and position() > 2]'
        self.sections = self.doc.xpath(xsect, namespaces=xns)
    
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
                self._add_proc(para, '\n'.join(pdata))
    
    def add_phase(self, phase_text):
        title = self.regx['phase'].sub('', phase_text.upper())
        self._phase = subel(self.xpub, 'phase', {'title': title})
    
    def add_unit(self, unit_text):
        self._unit = subel(self._phase, 'unit')
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
    
    def _add_proc(self, para, sect_text):
        proc = {
            'id': self.format_id(self.regx['proc'].match(para)[0]),
        }
        rev = self.regx['rev'].sub(self._rev_repl, sect_text)
        if rev:
            proc['rev'] = rev[-2:]
        proc['filename'] = proc['id'] + rev
        if 'advisory' in sect_text.lower():
            proc['advisory'] = 'True'
        if self.draft and 'bluesheet' in para.lower():
            proc['bs'] = 'True'
        etree.SubElement(self._unit, 'procedure', proc)
    
    def _rev_repl(self, match_obj):
        # return else '00' for NC in future
        return '.R' + (match_obj[1] if match_obj[1].isdigit() else '')
    
    def subel(self, parent, name, attrs={}):
        return etree.SubElement(parent, name, attrs)
    