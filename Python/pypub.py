import os
import glob
import re
import zipfile
from lxml import etree

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
        doc = docs[0] if (re.search('(?i)a-z|pull', docs[1]) else docs[1]
    parseOutline(zipfile.ZipFile(doc).open('word/document.xml').read())

def parseOutline(xdoc):
    # root is <w:document>, followed by body <w:body>
    # body contains paragraphs <w:p>
    # each paragraph contains runs of content <w:r>
    # runs have text inside them <w:t>
    doc = etree.fromstring(xdoc)
    
    
    
def cleanXML(doc):
    for par in doc.iter('w:p'):
    