#!/usr/bin/python
from pathlib import Path
from zipfile import ZipFile
import re
from lxml import etree
from datetime import datetime

# decided to record everything instead of just latest so i can have all data for other potential uses

root = Path('/Users/HD6904/Erik/Procedure Status/outlines')
log = Path('/Users/HD6904/Erik/Procedure Status/parser-results.txt')
procre = (r'\b(?:ABER.?PROC|AP|BZ|CC|CFS|CR|CRC|CRJ|CRM|CSRP|CWS|DR|DRC|DRM|'
           'DTAP|DTCC|DTDR|DTMC|DTMS|DTSC|DTSS|DTUW|DV|ER|FD|FDC|FDM|GVS|GPU|'
           'HPU|LS|MC|MDTCC|MS|MSCM|PMP|POS|RT|SC|SCC|SCCM|SCJ|SCMS|SING|SS|'
          r'SSC|SSH|SSJ|SW|TUTU|UTA|UW|UWHTSM?|WOC)\s*\d{2,4}(?:\S\w+)*')
jobs = {}
# use tuples like (rp, sm, date)

for f in root.iterdir():
    manualNumber = re.search(r'\d{4}', f.name)[0]
    with ZipFile(f) as zip:
        xdoc = zip.open('word/document.xml').read().decode()
    xdoc = re.sub(r'\b(r|w[a-z0-9]*):(?! )| xmlns[^>]+| encoding=\S+', '', xdoc)
    doc = etree.fromstring(re.sub(r'<tab/>', '<t>\t</t>', xdoc))
    text = getText(doc)
    dueDate = formatDate(
        re.search(r'DUE.+?(\d\d)[-/ ]?(\w+)[-/ ]?(\d\d)').expand(r'\1\2\3')
    )
    jobs[f.name[:-5]] = (re.findall(procre, text), manualNumber, dueDate)

def getText(doc):
    text = []
    app = text.append
    for p in doc.iter('p'):
        paraText = ''.join(list(p.itertext())).strip()
        if paraText and not re.match(r'\s*(\d-|[A-Z]+ ?)\d{5}', paraText, re.I):
            app(paraText)
    return '\n'.join(text).upper()

def formatDate(dateString):
    dateString = dateString.replace('-', '/')
    if '/' in dateString:
        d = datetime.strptime(dateString, '%m/%d/%y')
    else:
        d = datetime.strptime(dateString, '%m-%d-%y')
    return str(d.date())

def logProps(propObj):
    # rethink the procs/props structure...problem is not being able to decipher/rely
    # on due date formatting...unless I change them ahead of time
    # PROBLEM: using all procs, then manipulating data results in 100s of the same SS-15 file
    with open(log, 'a') as f:
        for job in jobs:
            # write (proc, manualNumber, dueDate) to each line
            f.write()
