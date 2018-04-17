import re
from lxml import etree

join = ''.join

class OutlineParser:
    def __init__(self, xdoc):
        self.ns = {
            'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
            'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
        }
        self.doc = etree.fromstring(re.sub(r'<w:(tab|br)/>', '<w:t>\t</w:t>', xdoc))[0]
        for node in self.doc.xpath('//w:p[./w:pPr//w:strike]', namespaces=xns):
            self.doc.remove(node)
        self.resplit = re.compile('\t+')
    
    def parse(self):
        # TODO: Add support for roman numeral volume numbers
        # REQUIRES PROJECT: TO BE ITS OWN LINE
        self.ptext = [''.join(t for t in p.itertext()) for p in self.doc]
        props = self.get_props(*self.ptext[0:5])
        xpub = etree.Element('project', props)
        sections = self.doc.xpath('//w:p[not(./w:pPr//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
        drawTest = re.compile(r'\d{5}|^\d-', re.I)
        procTest = re.compile(r'[A-Z]{2,6}\d{4}')
        bs = re.compile('bluesheet', re.I)
        for sectIndex, sect in enumerate(sections):
            docIndex = self.doc.index(sect)
            pdata = ptext[docIndex]
            if not ptext[docIndex + 1]:
                phase = re.sub(r' PHASE| PROCEDURES?|[\t].*)', '', pdata)
                phase = etree.SubElement(xpub, 'phase', name=phase)
            else:
                unit = etree.SubElement(phase, 'unit')
                if pdata.beginswith('STACK-UP'):
                    unit.set('title', 'Stack-Up and Sequence Drawings')
                elif pdata.beginswith('CONDUCTOR'):
                    unit.set('title', 'Conductor')
                elif 'TEST OPTION' in pdata:
                    unit.set('title', 'BOP Test Options')
            nextIndex = self.doc.index(sections[sectIndex + 1])
            for pdata in ptext[docIndex + 1:nextIndex]:
                if not pdata:
                    continue
                p = resplit.split(pdata)
                if drawTest.search(p[0]):
                    draw = etree.SubElement(unit, 'drawing', id=p[0].replace(' ', ''))
                    draw.text = p[1]
                    if draft and bs.match(pdata):
                        draw.set('bs', 'true')
                elif procTest.match(p[0]):
                    proc = etree.SubElement(unit, 'procedure', id=p[0].replace('/', '-'))
                    if draft and bs.match(pdata):
                        proc.set('bs', 'true')
                elif p[0].beginswith('Rev'):
                    proc.set('rev', p[0][-2:])
                elif 'ADVISORY' in pdata:
                    proc.set('advisory', "True")
                elif 'BTC' in pdata:
                    btc = join(p[0].split()[0:2])
                    proc = etree.SubElement(unit, 'procedure', id=btc)
        return xpub
    
    def get_props(self, sys, cust, proj, rig, sm):
        # check how i did release page for a V1R1 sm to figure out how to standardize lines
        # eg which line to check for rev (own line vs volume line)
        props = {
            'sys': sys.split('\t')[0],
            'cust': cust.split(': ', 1)[-1],
            'proj': proj.split(': ', 1)[-1],
            'rig': rig.split(': ')[-1],
            'draft': 'draft' in sm.lower()
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
        return props        
