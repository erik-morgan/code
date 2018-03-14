import os
import glob
import re
import zipfile
from lxml import etree

# TODO: ADD TITLES TO RUNNING PROCEDURE LIBRARY AS METADATA
dirs = {}

def init_pub():
    # TODO: add ability to change vars
    # TODO: if folders are on network, do os test to set network volume prefix (eg /Volumes vs N:/)
    global dirs
    varsFile = os.path.dirname(os.path.realpath(__file__)) + '/.pypub_vars'
    if os.path.exists(varsFile):
        with open(varsFile, 'r') as f:
            data = f.read().splitlines()
        dirs.pdf = data[0]
        dirs.draw = data[1]
    else:
        dirs.pdf = input('Enter path to PDFs folder: ')
        dirs.draw = input('Enter path to Drawings folder: ')
        with open(varsFile, 'w') as f:
            f.write(dirs.pdf + '\n' + dirs.draw)
    dirs.proj = input('Enter path to project folder: ')
    getOutline()

def getOutline():
    docs = glob.glob(dirs.proj + '/Outlines/*docx')
    if len(docs) == 1:
        doc = docs[0]
    else:
        doc = docs[0] if re.search('(?i)a-z|pull', docs[1]) else docs[1]
    parseOutline(zipfile.ZipFile(doc).open('word/document.xml').read())

def parseOutline(xdoc):
    # root is <w:document>, followed by body <w:body>
    # body contains paragraphs <w:p>
    # each paragraph contains runs of content <w:r>
    # runs have text inside them <w:t>
    #
    # Delete everything before TABLE OF CONTENTS line.
    # Delete paragraphs with strike-through.
    # Delete everything after tab.
    # First check for existence of all drawings (minus stack-ups)
    # 
    # save system, project, and rig from header
    
    doc = objectify(reformat(xdoc))
    
    

def reformat(doc_str):
    # check how word handles headers in xml
    # use outline metadata for proj details
    # urldecode special characters. see if lxml does it, or do global f/r
    # see if para.text or para.text_content() works
    # if there are no drawings matching with PL, try with just drawnum for drawings with -0x charts
    doc = etree.fromstring(doc_str)
    xns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    nstag = '{' + xns.w + '}'
    paras = doc.xpath('//w:p[not(.//w:strike) and not(.//w:u and .//w:caps and .//w:b)]', namespaces=xns)
    drawTest = re.compile('\d{5}', re.I)
    data = []
    app = data.append
    for para in paras:
        paraText = ''
        for run in para.iter('{*}r'):
            if run[-1].tag.endswith('tab'):
                paraText += '\t'
            else:
                paraText += run[-1].text
        if paraText.beginswith('Rev') and paraText !== 'Rev NC':
            app({'type': 'REV', 'data': paraText.split()[1]}
        
        if drawTest.search(paraText):
            app({'type': 'DRAWING', 'data': paraText}
    for para in data:
    rel = {
        'system': doc[0],
        'number': doc[0],
        'customer': doc[0],
        'project': doc[0],
        'rig': doc[0],
        'revision': doc[0],
        'volume': doc[0]
    }

def objectify(doc_str):
	doc_str = doc_str.replace('<w:br/>', '<w:t>\t</w:t>')
    doc = etree.fromstring(doc_str.replace('<w:tab/>', '<w:t>\t</w:t>'))
    xns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    nstag = lambda tag: '{' + xns.w + '}' + tag
    sects = doc.xpath('//w:p[not(.//w:strike) and .//w:u and .//w:b and position() > 2]', namespaces=xns)
    drawTest = re.compile('\d{5}', re.I)
    drawFormat = re.compile('^(\S+)\t+([^\t\r]+) ?[\s\S]*')
    data = []
    app = data.append
    for sect in sects:
        sectInfo = {'phase': '', 'title': '', 'docs': []}
        if sect.getnext().lastChild.lastChild.name !== nstag('t')
            sectTitle = ''.join(t[-1].text for t in sect.iter('{*}t'))
            sectTitle = re.sub('(?i)^([^\t\r]+) ?[\s\S]*', '$1', sectTitle).strip()
            if sectTitle.beginswith('STACK-UP') or 'TEST OPTION' in sectTitle:
                sectInfo.title = sectTitle if 'BOP' in sectTitle else 'STACK-UP DRAWINGS'
                sect = sect.getnext()
            else:
                activePhase = sectTitle
                continue
        sectInfo.phase = activePhase
        for p in sect.itersiblings('{*}p'):
            paraText = ''.join(t[-1].text for t in p.iter('{*}t'))
            if not paraText:
                break
            if drawTest.search(paraText):
                draw = re.sub(drawFormat, '$1\t$2', paraText).split('\t')
                sectInfo.docs.append({'type': 'DRAW', 'id': draw[0], 'description': draw[1]})
            elif re.match('[A-Z]{2,6}\d{4}', paraText):
                sectInfo.docs.append({'type': 'RP', 'id': paraText.split()[0].replace('/', '-')})
            elif paraText.beginswith('Rev'):
                sectInfo.docs[0].rev = int(paraText.split()[1])
            elif 'ADVISORY' in paraText:
                sectInfo.docs[0].advisory = True
            elif 'BTC' in paraText:
                btcText = re.sub('(BTC) (\d+) Rev (\d+).*', '$1$2 $3', paraText)
                sectInfo.docs.append({'type': 'BTC', 'id': btcText.split()[0], 'rev': int(btcText.split[1])})
        app(sectInfo)
        




