# 2018-08-22 23:30:07 #
#!/usr/bin/python
# from multiprocessing.dummy import Pool as ThreadPool
from pathlib import Path
import logging
import re
import requests as req
from lxml.html import fromstring as tohtml, get_element_by_id as get_id
from io import BytesIO
from PyPDF2 import PdfFileReader as Reader, PdfFileWriter as Writer, PdfFileMerger as Merger

# TODO: add multiprocessing support via ThreadPool
# TODO: add info logging statements like rev_check.sh
# TODO: check if login is needed on PC (requests-kerberos)
# TODO: add support for SUD/Gauging revs (by refactoring Drawings folder organization)
# TODO: find out if possible to have rev NR in lib (and if 0 is before/after NR)
# 

DRAW_PATH = '/Users/HD6904/Desktop/Drawings'
root = Path(DRAW_PATH)
log = logging.info
partre = re.compile(r'(([-0-9]+)(?:(?=.+\.-)\b|-\d+))'
                    r'\.([^.]+)\.([^.]+)', re.I)
revint = lambda s: sum((ord(c) - 64) * 26**n for n, c in enumerate(s[::-1]))

def main():
    log_file = root / 'pyrev.log'
    log_file.write_text()
    logging.basicConfig(
        filename = log_file,
        format = '[%(asctime)s] %(levelname)s:%(message)s',
        datefmt = '%Y-%m-%dT%H:%M:%S',
        level = logging.INFO
    )
    pull_list = check_revs()
    if pull_list:
        with open(join(root, 'pyrev.pull'), 'w') as f:
            f.write('\n'.join(pull_list))

def check_revs():
    pull_list = []
    draw_revs = {}
    for file in root.glob('[0-9X]-/*.*.*.???'):
        # num pages in raw text like:
        # /Type/Pages
        # /Kids.+
        # /Count #
        name = file.name
        spec, draw, drev, srev = partre.match(name).groups()
        if drev != '-':
            if draw not in draw_revs:
                draw_revs[draw] = get_rev(draw)
            new_rev = draw_revs[draw]
            if is_old(drev, new_rev):
                pull_list.append(draw)
################################################################################
# LEFT OFF HERE AFTER REFACTORING IS_OLD
################################################################################
        if spec_rev != '-':
            spec_rev_new = get_rev(spec)
            if is_old(spec_rev, spec_rev_new):
                spec_new = Writer()
                old_pgs = Reader(file.read_bytes()).pages
                new_pgs = rev_spec(spec)
                pg_diff = len(new_pgs) - len(old_pgs)
                spec_new
                for p, pg in enumerate(old_pgs):
                    if pg.mediaBox[3] > 800 or p < pg_diff:
                        spec_new.addPage(pg)
                    
                    
                spec_new.append(file, pages=(-1*spec.numPages, 0))
                pages = old_pgs[0:] + new_pgs
                for p, pg in enumerate(old_pgs):
                    if p 
                if len(old_pgs) > len(new_pgs):
                    for p in range(len(old_pgs)):
                        if p < 
                    for pg in old_pages[:spec_new.getNumPages() * -1]:
                        
                spec_new.
                if draw_rev != '-':
                    pdf.append(file, pages=(-1*spec.numPages, 0))
                pdf.append(spec_new)
                
            if is_old(spec, rev):
                spec = rev_spec(part)
                pdf = PdfFileMerger()
                if draw != '-':
                    pdf.append(file, pages=(-1*spec.numPages, 0))
                pdf.append(spec)
                with open(join(dirname(file),
                               f'{num}.{draw}.{rev}'), 'wb') as f:
                    pdf.write(f)
                pdf.close()
                remove(file)

def get_rev(part_num):
    url = 'http://houston/ErpWeb/PartDetails.aspx?PartNumber={part_num}'
    doc = tohtml(req.get(url).content)
    doc.get_id('revisionNum')
    
    return node.text_content() if node else ''

def is_old(rev1, rev2):
    r1 = revint(rev1) if rev1 != 'NC' else 0
    r2 = revint(rev2) if rev2 != 'NC' else 0
    return revint(r2) if r2 != 'NC' else 0 > revint(r1) if r1 != 'NC' else 0

def rev_spec(part_num):
    # Cookie: DqUserInfo=PartDocumentReader=AMERICAS\MorganEL;if necessary, get from env
    # if stream fails & it just downloads it anyway, then remove this func
    url = 'http://houston/ErpWeb/Part/PartDocumentReader.aspx'
    params = {'PartNumber': part_num, 'checkInProcess': 1}
    with req.get(url, params=params, stream=True) as response:
        pdf = Reader(BytesIO(response.raw.read()))
    return pdf.pages

def check_revs():
    pull_list = []
    dwgs = {}
    for file, num, draw, spec in iter_revs():
        if spec == '-':
            dwg = num
        else:
            dwg = num.rsplit('-', 1)[0]
            rev = get_rev(num)
            if is_old(spec, rev):
                spec = rev_spec(part)
                pdf = PdfFileMerger()
                if draw != '-':
                    pdf.append(file, pages=(-1*spec.numPages, 0))
                pdf.append(spec)
                with open(join(dirname(file),
                               f'{num}.{draw}.{rev}'), 'wb') as f:
                    pdf.write(f)
                pdf.close()
                remove(file)
        if draw != '-':
            if not dwg in dwgs:
                dwgs[dwg] = get_rev(dwg)
            rev = dwgs[dwg]
            if is_old(draw, rev):
                pull_list.append(dwg)
    return pull_list

if __name__ == '__main__':
    main()
