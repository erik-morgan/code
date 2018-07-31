#!/usr/bin/python
from pathlib import Path
from os import listdir
from zipfile import ZipFile
import re
from lxml import etree

root = Path('/Users/HD6904/Erik/Procedure Status/outlines')
rp_dwg_re = (r'\b(?:C[FW]S|[CD]R[CJM]?|CSRP|DV|ER|FD[CM]?|GVS|[GH]PU|'
             '(?:DT)?(?:AP|[CMS]{2,4}|DR|UW)|LS|PMP|POS|RT|S[CS]J|SING|SSH|SW|'
             r'UWHTSM?|WOC) ?\d{3,4}\S*|^(?:\d-)?\d{6}[-\d]+')
date_re = r'DUE.+?(\d\d)[-/ ]?(\w+)[-/ ]?(\d\d)'

# ALLOW FOR #-###### drawings (no dash number)

def main():
    procs = {}
    docxs = [f for f in listdir(root) if not f[0] != '.']
    progress = 'Processing File {0}/' + len(docxs) + ' ({1})'
    for i, docx in enumerate(docxs):
        doc = root / docx
        print(progress.format(i + 1, docx))
        doc_txt = parse_doc(doc).upper()
        due_date = formatDate(re.search(date_re, text).expand(r'\1\2\3'))
        # cleanup proc numbers separately, and delete if "based on"
        proc, draws = '', []
        for match in re.finditer(rp_dwg_re, doc_txt):
            match = match[0]
            if match[0].isdigit() and proc:
                draws.append(match)
            else:
                if draws:
                    draws = tuple(draws)
                    if draws not in procs[proc] or due_date > procs[proc][draws]:
                        procs[proc][draws] = due_date
                proc = format_proc(match)
                draws = []
                if not proc in procs:
                    procs[proc] = {}
        return procs

def parse_doc(doc_file):
    with ZipFile(doc_file) as zip:
        xdoc = zip.open('word/document.xml').read().decode()
    xdoc = re.sub(r'\b(aink|am3d|cx\d?|mc?|[orv]|w\w*):(?! )| xmlns[^>]+| encoding=\S+', '', xdoc)
    doc = etree.fromstring(xdoc.replace('<tab/>', '<t>\t</t>'))
    return '\n'.join(p for p in get_text(doc))

def get_text(doc):
    for p in doc.iter('p'):
        para_text = ''.join(list(p.itertext())).strip()
        if para_text and re.search(r'[0-9]{3}', para_text):
            yield para_text

def format_proc(proc):
    # full match: ([A-Z]+)\s*(\d{2,4})(.?\d\d)?(.?\d\d)?(.?\d\d)?(.?[A-Z]+)?
    base = re.match(r'([A-Z]+)\s*(\d{2,4})(?=\W)', proc)
    if base:
        proc = proc.replace(base[0], base[1] + base[2].rjust(4, '0'))
    ends = re.split(r'[^A-Z]+', proc)
    digits = ''.join(c for c in proc if c.isdigit())
    if len(digits) % 2 != 0:
        digits = '0' + digits
    return re.sub(r'(?<=\d\d)(\d\d)(?=\d\d)', r'\1-', digits).join(ends)

def format_date(date_str):
    if date_str.isnumeric():
        d = datetime.strptime(date_str, '%m%d%y')
    else:
        d = datetime.strptime(date_str, '%d%b%y')
    return str(d.date())

def parse_data(data):
    pass

if __name__ == '__main__':
    log = Path('/Users/HD6904/Erik/Procedure Status/part_data.txt')
    data = main()
    log.write_text(parse_data(data))
