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

def getProcs():
    for f in root.iterdir():
        if f.name.startswith('.'):
            continue
        name = f.name[:-5]
        print(name)
        smnum = re.search(r'\d{4}', name)[0]
        with ZipFile(f) as zip:
            xdoc = zip.open('word/document.xml').read().decode()
        xdoc = re.sub(r'\b(aink|am3d|cx\d?|mc?|[orv]|w\w*):(?! )| xmlns[^>]+| encoding=\S+', '', xdoc)
        doc = etree.fromstring(re.sub(r'<tab/>', '<t>\t</t>', xdoc))
        text = getText(doc)
        dueDate = formatDate(
            re.search(r'DUE.+?(\d\d)[-/ ]?(\w+)[-/ ]?(\d\d)', text).expand(r'\1\2\3')
        )
        for proc in re.finditer(procre, text):
            yield (formatProc(proc[0]), smnum, dueDate, name)

def getText(doc):
    paras = []
    app = paras.append
    for p in doc.iter('p'):
        paraText = ''.join(list(p.itertext())).strip()
        if paraText and not re.match(r'\s*(\d-|[A-Z]+ ?)\d{5}', paraText, re.I):
            app(paraText)
    return '\n'.join(paras).upper()

def formatDate(dateString):
    if dateString.isnumeric():
        d = datetime.strptime(dateString, '%m%d%y')
    else:
        d = datetime.strptime(dateString, '%d%b%y')
    return str(d.date())

def formatProc(proc):
    # full match: ([A-Z]+)\s*(\d{2,4})(.?\d\d)?(.?\d\d)?(.?\d\d)?(.?[A-Z]+)?
    base = re.match(r'([A-Z]+)\s*(\d{2,4})(?=\W)', proc)
    if base:
        proc = proc.replace(base[0], base[1] + base[2].rjust(4, '0'))
    ends = re.split(r'[^A-Z]+', proc)
    digits = ''.join(c for c in proc if c.isdigit())
    if len(digits) % 2 != 0:
        digits = '0' + digits
    return re.sub(r'(?<=\d\d)(\d\d)(?=\d\d)', r'\1-', digits).join(ends)

if __name__ == '__main__':
    log.write_text('\n'.join('\t'.join(proc) for proc in getProcs()))
