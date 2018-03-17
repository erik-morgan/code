import re
from zipfile import ZipFile
from pathlib import Path
from lxml import etree

# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
# TODO: 
join = ''.join
xns = {
    'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

def initPub():
    # TODO: add ability to change vars
    # TODO: refactor dirs or add os check b/c dirs are now PosixPath objects; switch back to string paths?
    # TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
    global dirs
    main()

def main():
    # Remove .outline.json after finished
    # Stop putting pull lists into outline folder
    # First check for existence of all drawings (minus stack-ups)
    # use outline metadata for proj details
    # urldecode special characters. see if lxml does it, or do global f/r
    # Use INDD RPs with TOCs in front instead of separate files
    # Ignore advisory, and stick it in to INDD
    # if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
    if dirs['opub'].exists():
        opub = etree.fromstring(dirs['opub'].read_bytes())
    else:
        with ZipFile(dirs['outline']) as zip:
            xdoc = zip.open('word/document.xml').read()
        opub = parseOutline(xdoc)
        dirs['opub'].write_bytes(etree.tostring(opub, pretty_print=True))

def parseOutline(outline):
    # xdoc = xdoc.replace('<w:br/>', '<w:t>\t</w:t>')
    # doc = etree.fromstring(re.sub(r':(br|tab)/', outline.replace('<w:tab/>', '<w:t>\t</w:t>'))
    xpub = etree.Element('project')
    meta = doc.xpath('//w:p[position() < 5]', namespaces=xns)
    xprops = xpub.attrib
    xprops['system'] = join(t for t in paraText(meta[0], True))
    xprops[''] = join(t for t in paraText(meta[0], True))
    xprops[''] = join(t for t in paraText(meta[0], True))
    xprops[''] = join(t for t in paraText(meta[0], True))
    xprops[''] = join(t for t in paraText(meta[0], True))
    xprops[''] = join(t for t in paraText(meta[0], True))
    
    
    
    sections = doc.xpath('//w:p[not(.//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
    drawTest = re.compile(r'\d{5}', re.I)
    procTest = re.compile(r'[A-Z]{2,6}\d{4}')
    resplit = re.compile(r'\t+')
    app = pub['data'].append
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
    return pub

# paraText = join(
#     r[-1].text if r[-1].tag[-2:] == '}t' else '\t'
#     for r in para.iter('{*}r'))
