import re
from pypub_config import PubDirs
from zipfile import ZipFile
from lxml import etree

# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
# TODO: 
dirs = PubDirs()
join = ''.join
xns = {
    'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

def main():
    # Remove .outline.json after finished
    # Stop putting pull lists into outline folder
    # First check for existence of all drawings (minus stack-ups)
    # use outline metadata for proj details
    # urldecode special characters. see if lxml does it, or do global f/r
    # Use INDD RPs with TOCs in front instead of separate files
    # Ignore advisory, and stick it in to INDD
    # if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
    # TODO: add ability to change vars
    # TODO: refactor dirs or add os check b/c dirs are now PosixPath objects; switch back to string paths?
    # TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
    dirs.getProject()
    if dirs.opub.exists():
        opub = etree.fromstring(dirs.opub.read_bytes())
    else:
        with ZipFile(dirs.docx) as zip:
            xdoc = zip.open('word/document.xml').read()
        opub = parseOutline(xdoc)
        dirs.opub.write_bytes(etree.tostring(opub, pretty_print=True))

def parseOutline(xdoc):
    doc = etree.fromstring(re.sub(r'<w:(tab|br)/>', '<w:t>\t</w:t>', xdoc))[0]
    xpub = etree.Element('project')
    ptext = [join(t for t in p.itertext()) for p in doc]
    resplit = re.compile('\t+')
    props = xpub.attrib
    props['sys'] = re.split(resplit, ptext[0])[0]
    m = re.fullmatch(r'Customer: (.+?)( \()?((?<= \()[^()]+)?(\))?', ptext[1])
    props['cust'], props['proj'] = m.groups(1, 2)
    props['rig'] = ptext[2].split(': ')[-1]
    m = re.match(r'Service Manual: (\d{4})(?: Volume )?(\S+)?(?: Rev )?(\d+)?', ptext[3])
    props['num'], props['vol'], props['rev'] = m.groups(1, 3)
    props['draft'] = 'draft' in ptext[3].lower()
    
    sections = doc.xpath('//w:p[not(.//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
    drawTest = re.compile(r'\d{5}', re.I)
    procTest = re.compile(r'[A-Z]{2,6}\d{4}')
    app = xpub['data'].append
    for section in sections:
        sectInfo = {'phase': '', 'title': '', 'docs': []}
        if section.getnext().lastChild.lastChild.tag[-2:] != '}t':
            sectTitle = join(t[-1].text for t in section.iter('{*}t'))
            sectTitle = re.sub(r'(?i)^([^\t\r]+) ?[\s\S]*', '$1', sectTitle).strip()
            if sectTitle.beginswith('STACK-UP') or 'TEST OPTION' in sectTitle:
                sectInfo['title'] = sectTitle if 'BOP' in sectTitle else 'STACK-UP DRAWINGS'
                section = section.getnext()
            else:
                activePhase = sectTitle
                continue
        sectInfo['phase'] = activePhase
        for p in section.itersiblings('{*}p'):
            paraText = join(t[-1].text for t in p.iter('{*}t'))
            if not paraText:
                break
            para = re.split(resplit, paraText.split('\r')[0])
            if drawTest.search(para[0]):
                sectInfo['docs'].append({'type': 'DRAW', 'id': para[0], 'description': para[1]})
            elif re.match(procTest, para[0]):
                # standardize RP naming convention (regarding CC0104-MT vs CC0104-QTM-CR vs CC0104-01MT)
                sectInfo['docs'].append({'type': 'RP', 'id': para[0].replace('/', '-')})
            elif para[0].beginswith('Rev'):
                proc = sectInfo['docs'][0]
                proc['rev'] = int(para[0].split()[1])
            elif 'ADVISORY' in paraText:
                proc = sectInfo['docs'][0]
                proc['advisory'] = True
            elif 'BTC' in paraText:
                btc = paraText.split()
                sectInfo['docs'].append({'type': 'BTC', 'id': join(btc[0:2]), 'rev': int(btc[3])})
        app(sectInfo)
    return xpub

# paraText = join(
#     r[-1].text if r[-1].tag[-2:] == '}t' else '\t'
#     for r in para.iter('{*}r'))
