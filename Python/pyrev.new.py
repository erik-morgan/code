# 2018-09-02 02:16:57 #
from pathlib import Path
from os import walk, remove
from os.path import join, split
import re
import requests as req
from lxml.html import fromstring, get_element_by_id
from io import BytesIO
from PyPDF2 import PdfFileReader as Reader, PdfFileWriter as Writer, PdfFileMerger as Merger
from concurrent.futures import ThreadPoolExecutor, as_completed

################################################################################
# 
# TODO: add support for SUD/Gauging revs (by refactoring Drawings folder organization)
# NOTE: num pages in raw text like: /Type/Pages ... \n/Kids.+ ... \n/Count #
# 
################################################################################

DRAW_PATH = '/Users/HD6904/Desktop/Drawings'
USER = 'MorganEL'

def main():
    files = [f for flist in get_files() for f in flist]
    with ThreadPoolExecutor() as pool:
        jobs = [pool.submit(check_revs, f) for f in files]
        pulls = {job.result() for job in as_completed(jobs)}
        pulls.remove(None)
    if pulls:
        pull.write_text('\n'.join(pulls))

def get_files():
    namerx = re.compile(r'[-0-9]+(\.[-A-Z0]{1,2}){2}\.pdf$', re.I)
    for path, dirs, files in walk(root):
        yield [join(path, f) for f in files if namerx.match(f)]

def check_revs(file):
    path, name = split(file)
    draw, spec = get_parts(name)
    draw_new, spec_new = fetch_rev(draw), fetch_rev(spec)
    if draw != draw_new and draw_new not in draws:
        retdraw = draw_new
        draw_new = draw
    if (draw, spec) != (draw_new, spec_new):
        name_new = '{0}.{1}.{2}.pdf'.format(name.split('.')[0],
                                            draw_new.split('.')[1],
                                            spec_new.split('.')[1])
        rev_file(join(path, name_new),
                 file if draw and draw == draw_new else draw_new,
                 file if spec and spec == spec_new else spec_new)
    

def get_parts(name):
    part, draw_rev, spec_rev = name.split('.')[0:-1]
    if '.-.' not in name:
        return f'{part.rsplit('-', 1)[0]}.{draw_rev}', f'{part}.{spec_rev}'
    elif draw_rev == '-':
        return None, f'{part}.{spec_rev}'
    else:
        return f'{part}.{draw_rev}', None

def fetch_rev(part):
    if part:
        part_num = part.split('.')[0]
        with req.get('http://houston/ErpWeb/PartDetails.aspx',
                     params={'PartNumber': part_num}) as reply:
            node = fromstring(reply.content).get_element_by_id('revisionNum')
            return f'{part}.{node.text_content()}'

def rev_file(file_path, draw, spec):
    draw = draws.get(draw, draw)
    if draw and spec:
        pdf = Merger()
        pages = None if '/pyrev/' in draw else (start, stop)
        # shit, spec can be a file path too
        # if draw is file, spec goes first
        # if spec is file, draw goes first
        # if neither is file, just merge them together
        # alternatively, just do them in order, and use reader.pages[slice]
        if spec.lower().endswith('.pdf'):
        spec = Reader(BytesIO(get_spec(spec.split('.')[0])))
    elif not spec:
        # read bytes from draw, and write bytes to file_path
    else:
        # write bytes directly to file_path

def get_spec(part_num):
    head = {'Cookie': f'DqUserInfo=PartDocumentReader=AMERICAS\\{USER}'}
    with req.get('http://houston/ErpWeb/Part/PartDocumentReader.aspx',
                 params={'PartNumber': part_num, 'checkInProcess': 0},
                 headers=head) as reply:
        return reply.content

if __name__ == '__main__':
    # switch from pathlib to os
    root = Path(DRAW_PATH)
    pyrev = root / 'pyrev'
    pyrev.mkdir(parents=True, exist_ok=True)
    pull = pyrev / 'pull.txt'
    draws = {f.name.rsplit('.', 1)[0]:f for f in pyrev.rglob('*.*.pdf')}
    main()
