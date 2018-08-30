# 2018-08-29 22:45:21 #
from pathlib import Path
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
    root = Path(DRAW_PATH)
    pyrev = root / '.pyrev'
    pyrev.mkdir(parents=True, exist_ok=True)
    pull_file = pyrev / 'pull.txt'
    files = dict(get_files(root / 'Library'))
    pull_list = check_revs(files)
    if pull_list:
        pull_list = rev_pulls(pull_list)
        pull_file.write_text('\n'.join(pull_list))

def get_files(lib_dir):
    for f in lib_dir.glob('*.*.*.???'):
        part, draw_rev, spec_rev = f.name.split('.')[0:-1]
        if '.-.' in f.name:
            yield f, (None, part)[::1 if drev == '-' else -1]
        else:
            yield f, (part.rsplit('-', 1)[0], part)

def check_revs(files):
    revs = get_revs(files)
    pull_list = {}
    for file, (draw, spec) in files.items():
        drev, srev = file.name.split('.')[1:2]
        revsd, revss = revs.get(draw, '-'), revs.get(spec, '-')
        if (drev, srev) != (revsd, revss):
            pull_list[file] = (f'{draw}.{revsd}' if draw else None,
                               f'{spec}.{revss}' if spec else None)
    return pull_list

def get_revs(files):
    # test difference between executor.map and executor.submit and zip(list, executor.map)
    parts = {part for parts in files.values() for part in parts if part}
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(fetch_rev, part) for part in parts]
        return dict([future.result() for future in as_completed(futures)])

def fetch_rev(part_num):
    url = 'http://houston/ErpWeb/PartDetails.aspx?PartNumber={part_num}'
    node = tohtml(req.get(url).content).by_id('revisionNum')
    if node:
        return part_num, node.text_content()

def rev_pulls(pulls):
    # destroy pulls as i go with pop, so ill have new pull list when done
    draws = {f.name.rsplit('.', 1)[0]:f for f in pyrev.rglob('*.*.pdf')}
    
    def dorev(file, (draw, spec)):
        if not draw:
            file_new = file.with_name(spec.replace('.', '.-.') + '.pdf')
            file_new.write_bytes(get_spec(spec))
        elif not spec:
            if draw not in draws:
                return draw
            file_new = file.with_name(draw + '.-.pdf')
            draws.pop(draw).replace(file_new)
        else:
            # file is out of rev by virtue of being in this list
            # if draw in file.name, then 
            #       use pages from file bc draw is at correct rev, so spec must be out of rev
            # elif draw in draws, then use its pages, bc draw is out of rev
            # else draw is NOT at correct rev, but it isn't in draws, so return draw for pull list
            # if file.name.endswith(spec.split('.')[1] + '.pdf'), then take spec pages from file
            # else get pages from get_spec
        file.unlink()
    
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
    main()
