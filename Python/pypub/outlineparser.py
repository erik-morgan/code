import re
from lxml import etree

# TODO: Add support for roman numeral volume numbers
# REQUIRES PROJECT: TO BE ITS OWN LINE
# CONSIDER IGNORING REVS BC IT SHOULD USE MAIN LIBRARY &
# THERE ARE CONSTANT TYPOS, BUT IT WOULD REQUIRE NEW TOCS EVERY TIME
# Use 2-digit revs, even for nc (00)?
# standardize drawing descriptions and attach as metadata to drawing library files

class OutlineParser:
    rx = {
        'split': re.compile(r'\t+'),
        'draw': re.compile(r'[0-9]{5}'),
        'proc': re.compile(r'^([A-Z]{2,6}\d{4}\S*|BTC ?\d\d)'),
        'phase': re.compile(r' PHASE| PROCEDURES?|[\t].*)')
        'rev': re.compile(r'[\S\s]*rev ([A-Z0-9]+)[\S\s]*', re.I),
        'clean': re.compile(r'\b[rw]:| xmlns[^>]+'),
    }
    
    def __init__(self, xdoc):
        self._clean_doc(xdoc)
        self.ptext = [self.get_ptxt(p) for p in self.doc]
        self.sections = self.doc.xpath('//p[.//u and .//b and .//t'
            'and not(starts-with(.//text(), "TABLE")) '
            'and not(starts-with(.//text(), "INTRO"))]')
    
    def _clean_doc(self, xdoc):
        xdoc = self.rx['clean'].sub('', xdoc)
        self.doc = etree.fromstring(xdoc)[0]
        props = self.get_props(self.doc[0:5])
        self.xpub = etree.Element('project', props)
        for strike in self.doc.xpath('//p[./pPr/rPr/strike]'):
            self.doc.remove(strike)
    
    def get_props(self, props):
        props = [self.get_ptxt(node) for node in props]
        sys, cust, proj, rig, sm = props
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
            tdiv = [s.strip() for s in self.rx['split'].split(para) if len(s)]
            if self.rx['draw'].match(tdiv[0]):
                self._add_draw(para, tdiv)
            elif self.rx['proc'].match(para):
                self._add_proc(para, '\n'.join(pdata))
    
    def get_ptxt(self, para):
        # test speed of targeted para.xpath vs general para.iter('r'); no longer needed?
        para_text = ''
        for el in para.xpath('./r/*[last()]'):
            if el.tag == 't':
                para_text += el.text
            if el.tag == 'tab' and para_text[-1] != '\t':
                para_text = para_text.strip() + '\t'
            if el.tag == 'br':
                break
        return para_text
    
    def add_phase(self, phase_text):
        title = self.rx['phase'].sub('', phase_text.upper())
        self._phase = subel(self.xpub, 'phase', {'title': title})
    
    def add_unit(self, unit_text):
        self._unit = subel(self._phase, 'unit')
        if unit_text.beginswith('STACK-UP'):
            unit.set('title', 'Stack-Up and Sequence Drawings')
        elif unit_text.beginswith('CONDUCTOR'):
            unit.set('title', 'Conductor')
        elif 'TEST OPTION' in unit_text:
            unit.set('title', 'BOP Test Options')
    
    def _add_draw(self, para, tdiv):
        draw = {
            'id': self.format_id(tdiv[0])
        }
        draw = subel(self._unit, 'drawing', id=)
        draw.text = tdiv[1]
        if self.draft and 'bluesheet' in para.lower():
            draw.set('bs', 'True')
    
    def _add_proc(self, para, sect_text):
        proc = {
            'id': self.format_id(self.rx['proc'].match(para)[0]),
        }
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
        # return else '00' for NC in future
        return '.R' + (match_obj[1] if match_obj[1].isdigit() else '')
    
    def subel(self, parent, name, attrs={}):
        return etree.SubElement(parent, name, attrs)
    
    def format_id(self, data):
        data = data.replace('/', '-')
        return data.replace(' ', '')
    
