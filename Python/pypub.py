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
    xml = doc_str.replace('<w:tab/>', '<w:t>\\t</w:t>')
    xml = xml.replace('</w:p>', '<w:r><w:t>\\r</w:t></w:r></w:p>')
    doc = etree.fromstring(xml)
    xns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    paras = doc.xpath('//w:p[not(.//w:strike) and not(.//w:u and .//w:caps and .//w:b)]', namespaces=xns)
    data = ['' if not p.text_content() else p.text_content() for p in paras]
    
    for xpara in paras:
        parText = 
        for run in xpara.iter('w:r'):
            if run[-1].tag is 'w:t':
                parText += run[-1].text
                if run[-1].tag is 'w:tab':
                    break
        if 'OUTLINE' in parText:
            break
            app(proj)
        if re.search('(?i)order|due|deliver|engineer|by:', parText):
            continue
        proj += parText + ' '
    paras = doc.xpath('//w:p[position()>' + (pindex + 1) + ']') #  and not(w:pPr/w:rPr/w:strike)
    for para in paras:
        # time difference if loop thru runs vs replacing tabs w/ txt
        pstyle = etree.tostring(para[0][-1])
        if 'w:strike' in pstyle or ('w:u' in pstyle and 'w:b' in pstyle):
            continue
        parText = ''
        runs = para.xpath('//w:r[not(w:rPr/w:strike)]')
        for run in runs:
            if run[-1].tag is 'w:t':
                parText += run[-1].text
            elif run[-1].tag is 'w:tab':
                parText += '\t'
            
        runs = xpara.xpath('//w:r[not(w:strike)]/w:t')
        if runs:
            paraText = ''
            for run in runs:


        if par.find('w:pPr')
    rel = {
        'system': doc[0],
        'number': doc[0],
        'customer': doc[0],
        'project': doc[0],
        'rig': doc[0],
        'revision': doc[0],
        'volume': doc[0]
    }

def objectify(docmap):
