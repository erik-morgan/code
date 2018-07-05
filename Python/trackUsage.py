#!/usr/bin/python
from pathlib import Path
from zipfile import ZipFile
import re
from lxml import etree

# Parse outlines, extract running procedures, and list them with the SM #
# If line begins has 5 numbers in a row, or begins with 2-, 4-, or 6-, skip it
# If line has less than 3 numbers, skip it
# 
# Option 2: loop thru, grabbing any possible matching lines, sort, and write to file
# 
# If line has the word Due, followed by a colon, capture it
# I guess I need to test if line contains (not begins with): \b[A-Z]{2,6}.?(\d{2,}\S*)
# Another option is to explicitly list all possible system prefixes, and test for those
# Ignore leading/trailing whitespace
# 
# ABER PROC|AP|BZ|CC|CFS|CR|CRC|CRJ|CRM|CWS|DR|DRC|DRM|DTAP|DTCC|DTDR|DTMC|DTSC|DTSS|DTUW|DV|ER|FD|FDC|FDM|GVS|GPU|HPU|MC|MS|SC|SCC|SCJ|SS|SSC|SSH|SSJ|UW|UWHTSM?|WOC

root = Path('/Users/HD6904/Erik/Procedure Status/outlines')
log = Path('/Users/HD6904/Erik/Procedure Status/parser-results.txt')
procs = {}

for f in root.iterdir():
    with ZipFile(f) as zip:
        xdoc = zip.open('word/document.xml').read().decode()
    xdoc = re.sub(r'\b(r|w[a-z0-9]*):(?! )| xmlns[^>]+| encoding=\S+', '', xdoc)
    doc = etree.fromstring()
    text = ''.join(t for t in doc.itertext('t'))
    props = {'smid': re.search(r'\d{4}', f.name)[0]}
    if 'due' in text.lower():
        # due date is really hard without standard format
        # just check outlines-txt for all date formats
        props['due'] = re.search(r'\bdue\b[-A-Z :]+?[-A-Z0-9 ]', text)[0]
    props['rpids'] = getProcs(text)
    procs[f.name] = props

def getProcs(text):
    match = re.search(r'\b(ABER.?PROC|BZ|C[FW]S|CR[CJM]?|DR[CM]|(DT)?'
                      r'(AP|DR|SS|UW|[CMS]C)|DV|ER|FD[CM]?|GVS|GPU|HPU|MS|'
                      r'S[CS][CHJ]|UWHTSM?|WOC)\b', text)
    
