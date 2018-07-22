#!/usr/bin/python
# from multiprocessing.dummy import Pool as ThreadPool
import os
import re
import logging
import requests as req
from lxml import html
import pypdf2

# TODO: add multiprocessing support via ThreadPool
# TODO: add info logging statements like rev_check.sh
# TODO: check if login is needed on PC (requests-kerberos)
# TODO: add support for SUD/Gauging revs (by refactoring Drawings folder organization)
# TODO: find out if possible to have rev NR in lib (and if 0 is before/after NR)

root = os.path.dirname(__file__)
login = {'user': '', 'pass': ''}
CONST_REVS = {
    'NC': 0.5,
    '0': 0.25,
    'NR': 0,
    '-': 0
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

def rev_num(ltrs):
    if ltrs in CONST_REVS:
        return CONST_REVS[ltrs]
    return sum(26**i * (ord(c) - 64) for i, c in enumerate(ltrs[::-1]))

def rev_spec(part_num, rev):
    # Cookie: DqUserInfo=PartDocumentReader=AMERICAS\MorganEL;if necessary, get from env
    with req.get(DL_URL.format(part_num), stream=True) as pdf:
        PdfFileMerger.append(pdf.raw)
    

def rev_draw(part_num, rev):
    # append to pull_list
    pass

def check_revs():
    pull_list = []
    for path, dirs, files in os.walk(root):
        for dwg in files:
            match = re.match(r'(([-\w]+)-\w+)\.([-A-Z0]{1,2})\.([-A-Z0]{1,2})', dwg)
            if not match:
                continue
            part_num, base_num, draw_rev, spec_rev = match.groups()
            # OPTION 1
            draw = None if draw_rev == '-' else (part_num if spec_rev == '-' else base_num)
            spec = None if spec_rev == '-' else part_num
            # OPTION 2
            draw = (part_num if spec_rev == '-' else base_num, draw_rev)
            spec = (part_num, spec_rev)
            rev_draw(*draw)
            rev_spec(*spec)
            # OPTION 3
            rev_draw(part_num if spec_rev == '-' else base_num, draw_rev)
            rev_spec(part_num, spec_rev)
            # OPTION 4
            if spec_rev == '-':
                draw = part_num
                spec = None
            else:
                draw = None if draw_rev == '-' else base_num
                spec = part_num
            
            if draw_rev != '-':
                if rev_num(get_rev(part_num if spec_rev == '-' else base_num))
                # do rev_num check vs get_rev
            if spec_rev != '-':
                # do rev_num check vs get_rev
            
            if rev_num(draw_rev_new) > rev_num(draw_rev):
                pass
            if rev_num(spec_rev_new) > rev_num(spec_rev):
                pass

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
    check_revs():

# pypdf2 examples
pdf_file = open('sample.pdf')
read_pdf = PyPDF2.PdfFileReader(pdf_file)
# num pages
number_of_pages = read_pdf.getNumPages()
# extract pages
# combine files

