#!/usr/bin/python
from pathlib import Path
from zipfile import ZipFile
import re
from lxml import etree

# Parse outlines, extract running procedures, and list them with the SM #
# If line begins has 5 numbers in a row, or begins with 2-, 4-, or 6-, skip it
# If line has less than 3 numbers, skip it
# Ignore leading/trailing whitespace
# 
# ABER PROC|AP|BZ|CC|CFS|CR|CRC|CRJ|CRM|CSRP|CWS|DR|DRC|DRM|DTAP|DTCC|DTDR|DTMC|DTMS|DTSC|DTSS|DTUW|DV|ER|FD|FDC|FDM|GVS|GPU|HPU|LS|MC|MDTCC|MS|MSCM|PMP|POS|RT|SC|SCC|SCCM|SCJ|SCMS|SING|SS|SSC|SSH|SSJ|SW|TUTU|UTA|UW|UWHTSM?|WOC
# 
# OPTIMIZED:
# \b(ABER.?PROC|BZ|CFS|CR[CJM]?|CSRP|CWS|(DT)?(AP|[CMS]{2,4}|DR|UW)|DV|ER|F?DR?[CM]?|GVS|GPU|HPU|LS|MDTCC|PMP|POS|RT|SCJ|SING|SSH|SSJ|SW|TUTU|UTA|UWHTSM?|WOC)\b

root = Path('/Users/HD6904/Erik/Procedure Status/outlines')
log = Path('/Users/HD6904/Erik/Procedure Status/parser-results.txt')
rpre = r'\b(ABER.?PROC|AP|BZ|CFS|[CMS]{2,4}|CR[CJM]?|CSRP|CWS|DR[CM]?|'
       + r'DT(AP|[CMS]{2}|DR|UW)|DV|ER|FD[CM]?|GVS|GPU|HPU|LS|MDTCC|PMP|POS|'
       + r'RT|SCJ|SING|SSH|SSJ|SW|TUTU|UTA|UW(HTSM?)?|WOC)\s*\d{2,4}'
procs = {}

for f in root.iterdir():
    with ZipFile(f) as zip:
        xdoc = zip.open('word/document.xml').read().decode()
    xdoc = re.sub(r'\b(r|w[a-z0-9]*):(?! )| xmlns[^>]+| encoding=\S+', '', xdoc)
    props = {
        'sm': re.search(r'\d{4}', f.name)[0],
        'rps': []
    }
    doc = etree.fromstring()
    for para in getText(doc):
        if 'due' not in props and re.match(r'(DRAFT )?DUE', para, re.I):
            props['due'] = re.sub(r'.*DUE( DATE)?[: ]+', '', para.upper())
        else:
            # this is where i test for procedures
    props['rpids'] = getProcs(text)
    procs[f.name] = props

def getProcs(text):
    match = re.search(r'\b(ABER.?PROC|BZ|CFS|CR[CJM]?|CSRP|CWS|(DT)?'
                      r'(AP|[CMS]{2,4}|DR|UW)|DV|ER|F?DR?[CM]?|GVS|GPU|HPU|'
                      r'LS|MDTCC|PMP|POS|RT|SCJ|SING|SSH|SSJ|SW|TUTU|UTA|UWHTSM?|WOC)\b', text)

def getText(doc):
    for p in doc.iter('p'):
        nodes = [e for r in p.iter('r') for e in r.iter('t', 'tab', 'br')]
        paraText = ''
        for node in nodes:
            tag = node.tag
            if tag == 'br':
                break
            if tag == 't':
                paraText += node.text
            elif tag == 'tab':
                paraText = paraText.strip() + '\t'
        if paraText.strip() and not re.search(r'^\d-|[-0-9]\d{5}', paraText):
            yield paraText
