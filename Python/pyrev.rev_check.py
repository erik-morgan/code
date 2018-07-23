#!/usr/bin/python
# from multiprocessing.dummy import Pool as ThreadPool
from os import walk, remove
from os.path import dirname, join
import re
import logging
import requests as req
from lxml import html
from io import BytesIO
from PyPDF2 import PdfFileReader, PdfFileWriter

# TODO: add multiprocessing support via ThreadPool
# TODO: add info logging statements like rev_check.sh
# TODO: check if login is needed on PC (requests-kerberos)
# TODO: add support for SUD/Gauging revs (by refactoring Drawings folder organization)
# TODO: find out if possible to have rev NR in lib (and if 0 is before/after NR)

root = dirname(__file__)
REVS = {
    'NC': 0.5,
    '0': 0.25,
    'NR': 0
}
PN_URL = 'http://houston/ErpWeb/PartDetails.aspx?PartNumber={0}'
DL_URL = 'http://houston/ErpWeb/Part/PartDocumentReader.aspx?PartNumber={0}&checkInProcess=1'

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
    reply = req.get(PN_URL.format(part_num))
    node = html.fromstring(reply.content).get_element_by_id('revisionNum')
    return node.text_content() if node else ''

def is_old(myrev, dqrev):
    # use int(rev, 36)!
    myrev = REVS[myrev] if myrev in REVS else int(myrev, 36)
    dqrev = REVS[dqrev] if dqrev in REVS else int(dqrev, 36)
    return dqrev > myrev

def rev_spec(part_num):
    # Cookie: DqUserInfo=PartDocumentReader=AMERICAS\MorganEL;if necessary, get from env
    # PdfFileMerger.append just creates a PdfFileReader anyway, but reader has numPages
    # if stream fails & it just downloads it anyway, then remove this func
    with req.get(DL_URL.format(part_num), stream=True) as response:
        return BytesIO(response.raw.read())

def check_revs():
    # keep dict of checked drawings to avoid duplicate scraping
    pull_list = []
    dwgs = {}
    for path, dirs, files in walk(root):
        for file in files:
            match = re.match(r'(([-\w]+)-\w+)\.([-A-Z0]{1,2})\.([-A-Z0]{1,2})', file)
            if not match:
                continue
            part, base, draw, spec = match.groups()
            if draw == '-':
                rev = get_rev(part)
                if is_old(rev, spec):
                    remove(join(path, file))
                    # doing it this way, i could use iter_content w/ yield
                    with open(join(path, f'{part}.-.{rev}.pdf'), 'wb') as f:
                        f.write(rev_spec(part))
            elif spec == '-':
                if part not in dwgs:
                    dwgs[part] = get_rev(part)
                if is_old(dwgs[part], draw):
                    pull_list.append(part)
            else:
                if base not in dwgs:
                    dwgs[base] = get_rev(base)
                if is_old(dwgs[base], draw):
                    pull_list.append(base)
                rev = get_rev(part)
                if is_old(rev, spec):
                    new_file = new_file = join(path, f'{part}.{draw}.{new_spec}')
                    spec = PdfFileReader(rev_spec(part))
                    pdf = PdfFileMerger()
                    pdf.append(join(path, file), pages=(-1 * spec.numPages, 0))
                    pdf.append(spec)
                    with open(new_file, 'wb') as f:
                        pdf.write(f)
                    remove(join(path, file))
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
    dwgs = check_revs()
    with open(join(root, 'pull-list'), 'w') as f:
        f.write('\n'.join(set(dwgs)))
    
