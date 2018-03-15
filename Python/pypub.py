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

def init_pub():
    # TODO: add ability to change vars
    # TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
    global dirs
    dirsFile = os.path.dirname(os.path.realpath(__file__)) + '/.pypub_vars.json'
    if os.path.exists(dirsFile):
        with open(dirsFile, 'r') as f:
            dirs = json.load(f)
    else:
        dirs.pdf = input('Enter path to PDFs folder: ')
        dirs.draw = input('Enter path to Drawings folder: ')
        with open(dirsFile, 'w') as f:
            json.dump(dirs, f, sort_keys=True, indent=4)
    dirs.project = input('Enter path to project folder: ')
    getOutline()

def getOutline():
    global dirs
    dirs.oproj = dirs.project + '/.oproj.json'
    docs = glob.glob(dirs.project + '/Outlines/*docx')
    if len(docs) == 1:
        dirs.outline = docs[0]
    else:
        dirs.outline = docs[0] if re.search('(?i)a-z|pull', docs[1]) else docs[1]
        # parseOutline(zipfile.ZipFile(doc).open('word/document.xml').read())
        with ZipFile(dirs.outline) as zip:
            xdoc = zip.open('word/document.xml').read()
            if 'docProps/custom.xml' not in zip.namelist():
                print('Set these REQUIRED custom Word properties:'
                      'system, number, customer, project, rig, and draft/rev/volume, if applicable'
                      'If there is no project/rig, write false for the value'
                      'This is very important: pypub will NOT validate the data')
                return
            xprops = zip.open('docProps/custom.xml').read()
        parseOutline(xdoc, xprops)

def parseOutline(xdoc, xprops):
    # Remove .outline.json after finished
    # First check for existence of all drawings (minus stack-ups)
    # use outline metadata for proj details
    # urldecode special characters. see if lxml does it, or do global f/r
    # if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
    projProps = set(['system', 'number', 'customer', 'project', 'rig', 'rev', 'volume', 'draft'])
    if os.path.exists(dirs.oproj):
        with open(dirs.oproj, 'r') as f:
            oproj = json.load(f)
    else:
        oproj = objectify(xdoc)
        props = {}
        for prop in etree.fromString(xprops):
            propName = prop.get('name').lower()
            props[propName] = prop[0].text
        if set(props.keys).issubset(projProps):
        # REMOVE ALL DOT NOTATION DUMBASS!
        oproj.system = doc.xpath('//property[contains(@name, "")]', namespaces=xns)
        oproj.number = 
        oproj.customer = 
        oproj.project = 
        oproj.rig = 
        oproj.revision = 
        oproj.volume = 
        with open(dirs.oproj, 'w') as f:
            json.dump(oproj, f, sort_keys=True, indent=4)

def objectify(doc_str):
    doc_str = doc_str.replace('<w:br/>', '<w:t>\t</w:t>')
    doc = etree.fromstring(doc_str.replace('<w:tab/>', '<w:t>\t</w:t>'))
    nstag = lambda tag: '{' + xns.w + '}' + tag
    sects = doc.xpath('//w:p[not(.//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
    drawTest = re.compile('\d{5}', re.I)
    procTest = re.compile('[A-Z]{2,6}\d{4}')
    resplit = re.compile('\t+')
    project = {'data': []}
    app = project.data.append
    join = ''.join
    for sect in sects:
        sectInfo = {'phase': '', 'title': '', 'docs': []}
        if sect.getnext().lastChild.lastChild.name !== nstag('t')
            sectTitle = join(t[-1].text for t in sect.iter('{*}t'))
            sectTitle = re.sub('(?i)^([^\t\r]+) ?[\s\S]*', '$1', sectTitle).strip()
            if sectTitle.beginswith('STACK-UP') or 'TEST OPTION' in sectTitle:
                sectInfo.title = sectTitle if 'BOP' in sectTitle else 'STACK-UP DRAWINGS'
                sect = sect.getnext()
            else:
                activePhase = sectTitle
                continue
        sectInfo.phase = activePhase
        for p in sect.itersiblings('{*}p'):
            paraText = join(t[-1].text for t in p.iter('{*}t'))
            if not paraText:
                break
            para = re.split(resplit, paraText.split('\r')[0])
            if drawTest.search(para[0]):
                sectInfo.docs.append({'type': 'DRAW', 'id': para[0], 'description': para[1]})
            elif re.match(procTest, para[0]):
                # standardize RP naming convention (regarding CC0104-MT vs CC0104-QTM-CR vs CC0104-01MT)
                sectInfo.docs.append({'type': 'RP', 'id': para[0].replace('/', '-')})
            elif para[0].beginswith('Rev'):
                sectInfo.docs[0].rev = int(para[0].split()[1])
            elif 'ADVISORY' in paraText:
                sectInfo.docs[0].advisory = True
            elif 'BTC' in paraText:
                btc = paraText.split()
                sectInfo.docs.append({'type': 'BTC', 'id': join(btc[0:2]), 'rev': int(btc[3])})
        app(sectInfo)
    return project



