# 2018-09-02 23:09:15 #
from os import walk, remove, mkdir
from os.path import exists, join, split
from fnmatch import filter as fnfilter
import re
import requests as req
from lxml.html import fromstring, get_element_by_id
from io import BytesIO
from PyPDF2 import PdfFileReader as Reader, PdfFileMerger as Merger, PageRange
from concurrent.futures import ThreadPoolExecutor, as_completed

################################################################################
# TODO: add support for SUD/Gauging revs (by refactoring Drawings folder organization)
################################################################################

DRAW_PATH = '/Users/HD6904/Desktop/Drawings'
USER = 'MorganEL'

def main():
    namerx = re.compile(r'[-0-9]+(\.[-A-Z0]{1,2}){2}\.pdf$', re.I)
    files = []
    for path, dirs, files in walk(root):
        files.extend(join(path, f) for f in files if namerx.match(f))
    with ThreadPoolExecutor() as pool:
        jobs = [pool.submit(check_revs, f) for f in files]
        pulls = {job.result() for job in as_completed(jobs)}
        pulls.remove(None)
    if pulls:
        pull.write_text('\n'.join(pulls))

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
        remove(file)
    return retdraw if retdraw else None

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
    return f'{part}.{node.text_content()}' if part else None

def rev_file(file_path, draw, spec):
    pdf = Merger()
    if draw in draws:
        draw_pdf = Reader(draws.get(draw, draw))
    if spec:
        spec_pdf = Reader(spec if '.' in spec[-3:] else get_spec(spec))
    if draw and spec:
        pdf.append(draw_pdf, pages=PageRange(':' if draw in draws else
                                             ':-' + spec_pdf.numPages))
        pdf.append(spec_pdf, pages=PageRange(':' if spec.count('.') == 1 else
                                             draw_pdf.numPages + ':'))
    else:
        pdf.append(spec_pdf if spec else draw_pdf)
    with open(file_path, 'wb') as f:
        pdf.write(f)

def get_spec(part_num):
    part_num = part_num.split('.')[0]
    head = {'Cookie': f'DqUserInfo=PartDocumentReader=AMERICAS\\{USER}'}
    with req.get('http://houston/ErpWeb/Part/PartDocumentReader.aspx',
                 params={'PartNumber': part_num, 'checkInProcess': 0},
                 headers=head, stream=True) as reply:
        return BytesIO(reply.raw.read())

if __name__ == '__main__':
    pyrev = join(DRAW_PATH, 'pyrev')
    if not exists(pyrev):
        mkdir(pyrev)
    pull = join(pyrev, 'pull.txt')
    draws = {}
    for path, dirs, files in walk(pyrev):
        for f in fnfilter(files, '*.*.pdf'):
            draws[f[:-4]] = join(path, f)
    main()
    for f in draws.values():
        remove(f)
