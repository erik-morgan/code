#!/usr/bin/python
# from multiprocessing.dummy import Pool as ThreadPool
from os import walk, remove
from os.path import dirname, join
import re
import logging
import requests as req
from lxml.html import fromstring as tohtml, get_element_by_id as get_id
from io import BytesIO
from PyPDF2 import PdfFileReader, PdfFileWriter

# TODO: add multiprocessing support via ThreadPool
# TODO: add info logging statements like rev_check.sh
# TODO: check if login is needed on PC (requests-kerberos)
# TODO: add support for SUD/Gauging revs (by refactoring Drawings folder organization)
# TODO: find out if possible to have rev NR in lib (and if 0 is before/after NR)

root = dirname(__file__)
log = logging.info
REVS = {
    'NC': 0.5,
    '0': 0.25,
    'NR': 0
}

def get_creds():
    from tkinter import Tk, Label, Entry, Button
    win = Tk()
    win.resizable(width=False, height=False)
    win.title('DQ Login Credentials')
    
    user_label = Label(win, text='Username: ')
    user_label.grid(column=0, row=0, padx=15, pady=15, sticky='NESW')
    user = Entry(win, width=30, validate='key', highlightthickness=1)
    user.grid(column=1, row=0, padx=15, pady=15, sticky='NESW')
    
    pswd_label = Label(win, text='Password: ')
    pswd_label.grid(column=0, row=1, padx=15, sticky='NESW')
    pswd = Entry(win, width=30, show='*', validate='key')
    pswd.grid(column=1, row=1, padx=15, sticky='NESW')
    
    ok = Button(win, text='Ok', state='disabled')
    ok.grid(column=1, row=2, padx=15, pady=15, sticky='E')

    def validate(text, name):
        if name == str(user):
            user_flag = text.isalpha()
            col = 'black' if user_flag else 'red'
            user['highlightcolor'] = user['highlightbackground'] = col
        else:
            user_flag = user.get().isalpha()
        ok['state'] = 'normal' if user_flag and len(pswd.get()) > 0 else 'disabled'
        return True
    
    def submit():
        creds = (user.get(), pswd.get())
        win.destroy()
        return creds
    
    vcmd = (win.register(validate), '%P', '%W')
    user['validatecommand'] = pswd['validatecommand'] = vcmd
    user.focus_set()
    ok['command'] = submit
    win.mainloop()

def get_rev(part_num):
    url = 'http://houston/ErpWeb/PartDetails.aspx?PartNumber={part_num}'
    node = tohtml(req.get(url).content).get_id('revisionNum')
    return node.text_content() if node else ''

def is_old(rev1, rev2):
    rev1 = REVS[rev1] if rev1 in REVS else int(rev1, 36)
    rev2 = REVS[rev2] if rev2 in REVS else int(rev2, 36)
    return rev2 > rev1

def rev_spec(part_num):
    # Cookie: DqUserInfo=PartDocumentReader=AMERICAS\MorganEL;if necessary, get from env
    # if stream fails & it just downloads it anyway, then remove this func
    url = 'http://houston/ErpWeb/Part/PartDocumentReader.aspx'
    params = {'PartNumber': part_num, 'checkInProcess': 1}
    with req.get(url, params=params, stream=True) as response:
        pdf = PdfFileReader(BytesIO(response.raw.read()))
    return pdf

def iter_revs():
    partrx = r'([-\w]+)\.([-A-Z0]{1,2})\.([-A-Z0]{1,2})'
    for path, dirs, files in walk(root):
        for f in files:
            match = re.match(partrx, f)
            if match:
                yield join(path, f), *match.groups()
    

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

def main():
    log_file = os.path.join(root, 'pyrev.log')
    with open(log_file, 'w') as f:
        pass
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
-