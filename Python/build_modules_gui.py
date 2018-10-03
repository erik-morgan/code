# 2018-10-03 17:50:05 #
import tkinter as tk
from tkinter import ttk
from tkinter import filedialog
from tkinter.font import nametofont
import os
from PyPDF2 import PdfFileReader as Reader, PdfFileMerger as Merger
from fnmatch import filter as fnfilter
import string
import re

class BuildModulesApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.resizable(width=True, height=False)
        self.title('Build Modules (by Erik Morgan)')
    
    def launch_form(self):
        self.form = FormFrame(self, self.build_modules)
        self.form.build_form()
        self.form.pack(expand=True, fill='both')
        self.center()
    
    def build_modules(self):
        self.build_libs()
        self.form.destroy()
        self.update_idletasks()
        self.prog = ProgressFrame(self, self.tocs)
        self.prog.pack(expand=True, fill='both')
        self.center()
        self.update()
        builder = ModuleBuilder()
        builder.dest = self.dirs['dest'] + os.sep
        for toc, toc_path in self.tocs.items():
            missing = []
            build_paths = builder.scrape(toc, toc_path)
            if build_paths:
                for n, name in enumerate(build_paths):
                    build_paths[n] = self.lib.get(name)
                    if name not in self.lib:
                        missing.append(name)
                if all(build_paths):
                    builder.build([toc_path] + build_paths)
                    status = 'Build Complete!'
                    if self.rmtocs:
                        os.remove(toc_path)
                else:
                    status = 'Missing: ' + ', '.join(missing)
            else:
                status = 'Error reading TOC'
            self.prog.update_window(toc, status)
            self.update_idletasks()
    
    def build_libs(self):
        self.dirs = self.form.fields
        self.rmtocs = self.form.rmtocs.get()
        self.tocs = {}
        for path, fname in self.iter_dir('tocs', pat='*TOC.pdf'):
            self.tocs[fname[:-4]] = f'{path}{os.sep}{fname}'
        self.lib = {}
        for path, fname in self.iter_dir('pdfs', 'dwgs', pat='*.pdf'):
            fmatch = re.match(r'^[-A-Z0-9/]+', fname, flags=re.I)
            if fmatch:
                fid = fmatch[0].replace('/', '-')
                self.lib[fid] = f'{path}{os.sep}{fname}'
    
    def iter_dir(self, *args, pat='*'):
        dirs = [self.dirs[a] for a in args]
        steps = (step for d in dirs for step in os.walk(d))
        for path, folds, files in steps:
            files = fnfilter(files, '[!.]*')
            folds[:] = [fold for fold in folds if not fold.startswith('.')]
            yield from ((path, f) for f in fnfilter(files, pat))
    
    def center(self):
        self.update_idletasks()
        w = self.winfo_reqwidth() / 2
        h = self.winfo_reqheight() / 2
        wscreen, hscreen = self.maxsize()
        self.geometry(f'+{int(wscreen / 2 - w)}+{int(hscreen / 2 - h)}')

class FormFrame(ttk.Frame):
    def __init__(self, master, onrun):
        super().__init__(master, padding=16)
        self.master = master
        self.bind('<Escape>', self.master.quit)
        self.onrun = onrun
        self.rmtocs = tk.BooleanVar()
        self.fields = {
            'pdfs': 'PDFs Location:',
            'dwgs': 'Drawings Location:',
            'tocs': 'Project TOCs:',
            'dest': 'Destination:'
        }
    
    def build_form(self):
        for r, name in enumerate(self.fields):
            self.add_field(r, name)
        check = ttk.Checkbutton(self, variable=self.rmtocs, text='Delete used TOCs')
        check.grid(column=0, row=4, sticky='nesw', pady=(0, 16))
        cancel = ttk.Button(self, text='Cancel', command=self.master.quit)
        cancel.grid(column=1, row=4, sticky='nes', padx=8, pady=(0, 16))
        self.run = ttk.Button(self, text='Run', state='disabled', command=self.onrun)
        self.run.grid(column=2, row=4, sticky='nesw', pady=(0, 16))
        self.columnconfigure(1, weight=1)
    
    def add_field(self, r, name):
        def browse():
            path = filedialog.askdirectory(initialdir='.', mustexist=True)
            if path:
                svar.set(path)
                self.fields[name] = path
            if all(self.fields.values()):
                self.run.configure(state='normal')
        svar = tk.StringVar()
        lbl = ttk.Label(self, text=self.fields[name])
        fld = ttk.Entry(self, width=60, state='readonly', textvariable=svar)
        btn = ttk.Button(self, text='Browse', command=browse)
        lbl.grid(column=0, row=r, sticky='w', pady=(0, 16))
        fld.grid(column=1, row=r, sticky='nesw', padx=8, pady=(0, 16))
        btn.grid(column=2, row=r, sticky='nesw', pady=(0, 16))

class ProgressFrame(ttk.Frame):
    def __init__(self, master, tocs):
        super().__init__(master, padding=16)
        self.master = master
        self.tocs = tocs
        self.pbval = tk.IntVar()
        self.pb = ttk.Progressbar(self, maximum=len(tocs), variable=self.pbval)
        self.pb.grid(column=0, row=0, columnspan=2, pady=(0, 16), sticky='nesw')
        self.build_table()
        self.close = ttk.Button(self, text='Close', command=self.master.destroy)
        self.close.grid(column=0, row=3, columnspan=2, pady=16)
    
    def build_table(self):
        charw = nametofont('TkDefaultFont').measure('0')
        minw = len(max(self.tocs, key=len)) * charw + 16
        self.table = ttk.Treeview(self, height=len(self.tocs), selectmode='none',
                                  show='headings', columns=('tocs', 'status'))
        self.table.column('tocs', minwidth=minw, stretch=False)
        self.table.heading('tocs', text='TOCs')
        self.table.column('status', minwidth=minw)
        self.table.heading('status', text='Status')
        for toc in self.tocs:
            self.table.insert('', 'end', toc, values=(toc, ''))
        self.table.grid(column=0, row=1, sticky='nesw')
        xsb = ttk.Scrollbar(self, orient='horizontal', command=self.table.xview)
        ysb = ttk.Scrollbar(self, orient='vertical', command=self.table.yview)
        self.table.configure(xscrollcommand=xsb.set, yscrollcommand=ysb.set)
        xsb.grid(column=0, row=2, columnspan=2, sticky='ew')
        ysb.grid(column=1, row=1, sticky='ns')
    
    def update_window(self, iid, status):
        self.table.set(iid, 'status', status)
        self.pbval.set(self.pbval.get() + 1)
        if self.pbval.get() == self.pb['maximum']:
            self.close.configure(state='normal')

class ModuleBuilder:
    def __init__(self):
        self.parser = PDFParser()
        self.draws = re.compile(r'^(?:\d-)?(?:[A-Z]{1,2}[- ]?)?\d{4,}[-\w]*(?=\s)', re.I|re.M)
    
    def scrape(self, name, path):
        self.name = re.match(r'^[^. ]+', name)[0]
        docs = [self.name]
        try:
            txt = self.parser.get_text(path).upper()
        except:
            # what if it is a non-searchable pdf?
            return []
        if 'ILLUSTRATION' in txt:
            txt = txt.split('ILLUSTRATION')[1]
        elif 'ASSEMBLY DRAWING' in txt:
            txt = txt.split('ASSEMBLY DRAWING')[1]
        docs.extend(self.draws.findall(txt))
        return docs
    
    def build(self, files):
        out_path = self.dest + self.name
        num = 1
        ext = '.pdf'
        while os.path.exists(f'{out_path}{ext}'):
            num += 1
            ext = f'.{num}.pdf'
        out_path += ext
        pdf = Merger()
        for f in files:
            pdf.append(f)
        pdf.write(out_path)
    

class PDFParser:
    escapes = {'n': '\n', 'r': '\r', 't': '\t'}
    hexes = {}
    printable = set(string.printable)
    hexdigits = set(string.hexdigits)
    
    def get_text(self, pdf):
        self.pos = 0
        pages = Reader(pdf).pages
        text = '\n'.join(''.join(self.parse(page)) for page in pages)
        text = re.sub(r'\\(\d{1,3})', self.fromoct, text)
        text = re.sub(r'\s*\n\s*', '\n', text)
        text = re.sub(r'(?<=\S)-\s+', '', text)
        text = re.sub(r' {2,}', ' ', text)
        return text
    
    def parse(self, page):
        data = page.getContents().getData().decode()
        tokens = re.compile(r'\(|(?<!<)<(?!<)|([\d.]+)?\s(Td|TD|Tm|T\*\'|")\b')
        tm = '0'
        token = tokens.search(data)
        while token:
            tok = token[0]
            self.pos = token.end()
            if tok[0].isdigit():
                if token[2] == 'Tm' and token[1] != tm:
                    tm = token[1]
                    yield '\n'
                elif token[2] in 'TdTD' and token[1] != '0':
                    yield '\n'
            elif tok == '(':
                yield from self.parse_str(data)
            elif tok == '<':
                yield from self.parse_hex(data)
            else:
                yield '\n'
            token = tokens.search(data, self.pos)
    
    def parse_str(self, data):
        token_sum = 0
        while True:
            char = data[self.pos]
            if char in '()':
                if char == ')' and token_sum == 0:
                    break
                else:
                    token_sum += 1 if char == '(' else -1
            if char == '\\':
                self.pos += 1
                char = data[self.pos]
                if char in '\n\r' and data[self.pos + 1] in '\n\r':
                    self.pos += 1
                elif char.isdigit():
                    char = '\\' + char
                else:
                    char = self.escapes.get(char, char)
            self.pos += 1
            yield char
    
    def parse_hex(self, data):
        remainder = {0: '', 1: '0'}
        hchars = data[self.pos:data.find('>', self.pos)]
        self.pos += len(hchars)
        if hchars not in self.hexes and set(hchars) < self.hexdigits:
            hexstr = hchars + remainder[len(hchars) % 2]
            code = 'utf-16' if hexstr.startswith('FEFF') else 'utf-8'
            hexstr = bytes.fromhex(hexstr).decode(code)
            if set(hexstr) < self.printable:
                self.hexes[hchars] = hexstr
        yield self.hexes.get(hchars, '')
    
    @staticmethod
    def fromoct(match):
        c = chr(int(match[1], 8))
        return c if c in string.printable else ' '

if __name__ == '__main__':
    app = BuildModulesApp()
    app.launch_form()
    app.mainloop()
