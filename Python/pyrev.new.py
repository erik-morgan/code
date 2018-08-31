# 2018-08-30 23:53:26 #
from pathlib import Path
from os import walk, remove
from os.path import join, basename
import re
import requests as req
from lxml.html import fromstring as tohtml, get_element_by_id as by_id
from io import BytesIO
from PyPDF2 import PdfFileReader as Reader, PdfFileWriter as Writer, PdfFileMerger as Merger
from concurrent.futures import ThreadPoolExecutor, as_completed

# TODO: add support for SUD/Gauging revs (by refactoring Drawings folder organization)
# TODO: merge 2-, 4-, 6-, 7-, and X- into single folder called Units or Assembly Drawings or Library
# TODO: idk how necessary pathlib is (wrt os/os.path)
# NOTE: num pages in raw text like: /Type/Pages ... \n/Kids.+ ... \n/Count #
################################################################################
# 
# pyrev.new is for an alternate way of processing drawing files:
# In this version, I'll use multithreading once, at a high level, to fully process each file.
# There will be 1 main function (as entry point) to handle processing. 
# While it may be inefficient to repeat requests for dwg revs, (I can partially mitigate that 
#   using a dict of processed dwg revs) the logic will be far simpler, and with less overhead.
# 
################################################################################

DRAW_PATH = '/Users/HD6904/Desktop/Drawings'
USER = 'MorganEL'

def main():
    files = [f for flist in get_files() for f in flist]
    # option 1) global var for dict of draw revs
    # option 2) nested function closure
    # option 3) get draw revs beforehand
    # option 4) send dict as argument to check_rev (test if i have to return rev, or if it can be mutated in-func)
    # option 5) don't use a draws dict at all, just repeat func calls
    # option 6) return revs, add to dict, & if key is in dict, send it to func? probably won't work bc all futures made at once
    # i think that just passing it w/o returning will work...
    revs = {}
    pulls = []
    with ThreadPoolExecutor() as pool:
        jobs = [pool.submit(check_revs, f, revs) for f in files]
        pulls = {job.result() for job in as_completed(jobs)}
        pulls.remove(None)
    if pulls:
        pull.write_text('\n'.join(pulls))

def get_files():
    namerx = re.compile(r'[-0-9]+(\.[-A-Z0]{1,2}){2}\.pdf$', re.I)
    for path, dirs, files in walk(root):
        yield [join(path, f) for f in files if namerx.match(f)]

def check_revs(file, draw_revs):
    name = basename(file)
    (draw, )
    

def get_parts(name):
    part, draw_rev, spec_rev = name.split('.')[0:-1]
    if '.-.' not in name:
        return (part.rsplit('.', 1)[0], draw_rev), (part, spec_rev)
    elif draw_rev == '-':
        return (None, '-'), (part, spec_rev)
    else:
        return (part, draw_rev), (None, '-')

def fetch_rev(part_num):
    url = 'http://houston/ErpWeb/PartDetails.aspx?PartNumber={part_num}'
    node = tohtml(req.get(url).content).by_id('revisionNum')
    return node.text_content() if node else '-'

def rev_pulls(pulls):
    def dorev(file, (draw, spec)):
        if not draw:
            file_new = file.with_name(spec.replace('.', '.-.') + '.pdf')
            file_new.write_bytes(get_spec(spec))
        elif not spec:
            if draw not in draws:
                return draw
            file_new = file.with_name(draw + '.-.pdf')
            draws.pop(draw).replace(file_new)
    
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(f, pulls[f]) for f in pulls]
        retcodes = {future.result() for future in as_completed(futures)}
        return [rc for rc in retcodes if rc]
    # remove draws when done

def get_spec(part_num):
    head = {'Cookie': f'DqUserInfo=PartDocumentReader=AMERICAS\\{USER}'}
    with req.get('http://houston/ErpWeb/Part/PartDocumentReader.aspx',
                 params={'PartNumber': part_num, 'checkInProcess': 0},
                 headers=head) as reply:
        return reply.content

if __name__ == '__main__':
    root = Path(DRAW_PATH)
    pyrev = root / '.pyrev'
    pyrev.mkdir(parents=True, exist_ok=True)
    pull = pyrev / 'pull.txt'
    main()
