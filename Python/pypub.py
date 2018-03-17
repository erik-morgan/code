import os
import glob
import re
from zipfile import ZipFile
import json
from lxml import etree

# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
# TODO: 
dirs = {}
xns = {
    'vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}
exists = os.path.exists

def initPub():
    # TODO: add ability to change vars
    # TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
    global dirs
    dirsFile = os.path.dirname(os.path.realpath(__file__)) + '/pypub_vars.json'
    with open(dirsFile, 'r+') as f:
        if exists(dirsFile):
            dirs = json.load(f)
        else:
            dirs['pdf'] = getPath('Enter path to PDFs folder: ', 'dir')
            dirs['indd'] = getPath('Enter path to InDesign folder: ', 'dir')
            dirs['draw'] = getPath('Enter path to Drawings folder: ', 'dir')
            json.dump(dirs, f, sort_keys=True, indent=4)
            print('PDF and Drawings folder paths saved to: ' + dirsFile)
    dirs['project'] = getPath('Enter path to project folder: ', 'dir')
    os.chdir(dirs['project'])
    try:
        dirs['outline'] = glob.glob('**/*Outline.docx')[0]
    except IndexError:
        print('No outline found in project folder. Outline must end in "Outline.docx"')
        return
    dirs['opub'] = '.opub.json'
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
    with open(dirs['opub'], 'r+') as f:
        if exists(dirs['opub']):
            opub = json.load(f)
        else:
            with ZipFile(dirs['outline']) as zip:
                xdoc = zip.open('word/document.xml').read()
            opub = parseOutline(xdoc)
            json.dump(opub, f, sort_keys=True, indent=4)

def parseOutline(outline):
    # xdoc = xdoc.replace('<w:br/>', '<w:t>\t</w:t>')
    
    doc = etree.fromstring(re.sub(':(br|tab)/', outline.replace('<w:tab/>', '<w:t>\t</w:t>'))
    xpub = etree.Element('project')
    nstag = lambda tag: '{' + xns.w + '}' + tag
    meta = doc.xpath('//w:p[position() < 5]', namespaces=xns)
    xprops = xpub.attrib
    xprops[''] = 
    xprops[''] = 
    xprops[''] = 
    xprops[''] = 
    xprops[''] = 
    xprops[''] = 
    
    
    
    sections = doc.xpath('//w:p[not(.//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
    drawTest = re.compile('\d{5}', re.I)
    procTest = re.compile('[A-Z]{2,6}\d{4}')
    resplit = re.compile('\t+')
    app = pub['data'].append
    join = ''.join
    for section in sections:
        sectInfo = {'phase': '', 'title': '', 'docs': []}
        if section.getnext().lastChild.lastChild.name !== nstag('t')
            sectTitle = join(t[-1].text for t in section.iter('{*}t'))
            sectTitle = re.sub('(?i)^([^\t\r]+) ?[\s\S]*', '$1', sectTitle).strip()
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

def getPath(inPrompt, inType):
    inPath = ''
    isType = os.path.isdir if inType == 'dir' else os.path.isfile
    while not (inPath and exists(inPath) and isType(inPath)):
        inPath = input(inPrompt)
    return inPath

def getParaText(para):
    paraText = join(
        '\t' if r[-1].tag !== nstag('t') else r[-1].text
        for r in para.iter('{*}r'))
    for r in para.iter:
        
    