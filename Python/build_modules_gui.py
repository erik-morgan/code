# 2018-09-29 12:50:43 #
from tkinter import BooleanVar, filedialog, IntVar, StringVar, Tk
from tkinter.ttk import Button, Checkbutton, Entry, Frame, Label, Progressbar, Style, Treeview
from os import walk, remove, sep
from PyPDF2 import PdfFileReader as Reader, PdfFileMerger as Merger
from fnmatch import filter as fnfilter
import re

class BuildModulesApp(Tk):
    def __init__(self):
        super().__init__()
        self.resizable(width=True, height=False)
        self.title('Build Modules (by Erik Morgan)')
    
    def launch_form(self):
        s = Style()
        s.theme_use('aqua' if 'aqua' in s.theme_names() else 'clam')
        self.form = FormFrame(self, self.build_modules)
        self.form.build_form()
        self.form.pack(expand=True, fill='both')
    
    def build_modules(self):
        self.dirs = self.form.dirs
        self.rmtocs = self.form.rmtocs.get()
        self.form.destroy()
        self.build_libs()
        self.prog = ProgressFrame(self, self.tocs)
        self.prog.pack(expand=True, fill='both')
    
    def build_libs(self):
        # SET LIBS TO CLASS ATTRIBUTE OF MODULE CLASS
        rx = re.compile(r'^[-A-Z0-9/]+', re.I)
        self.tocs = {}
        for path, fname in self.iter_dir('tocs', pat='*TOC.pdf'):
            self.tocs[fname[:-5]] = f'{path}{sep}{fname}'
        self.lib = {}
        for path, fname in self.iter_dir('pdfs', 'dwgs', pat='*.pdf'):
            fmatch = rx.match(fname)
            if fmatch:
                self.lib[fmatch.group()] = f'{path}{sep}{fname}'
    
    def iter_dir(self, *args, pat='*'):
        dirs = [self.dirs(a) for a in args]
        steps = (step for d in dirs for step in walk(d))
        for path, folds, files in steps:
            files = fnfilter(files, '[!.]*')
            folds[:] = [fold for fold in folds if not fold.startswith('.')]
            yield from ((path, f) for f in fnfilter(files, pat))
    

class FormFrame(Frame):
    def __init__(self, master, onrun):
        super().__init__(master, padding=16)
        self.master = master
        self.bind('<Escape>', self.master.quit)
        self.onrun = onrun
        self.rmtocs = BooleanVar()
        self.fields = {
            'pdfs': 'PDFs Location:',
            'dwgs': 'Drawings Location:',
            'tocs': 'Project TOCs:',
            'dest': 'Destination:'
        }
    
    def build_form(self):
        for r, name in enumerate(self.fields):
            self.add_field(r, name)
        check = Checkbutton(self, variable=self.rmtocs, text='Delete used TOCs')
        check.grid(column=0, row=4, columnspan=3, sticky='w', pady=(0, 16))
        cancel = Button(self, text='Cancel', command=self.master.quit)
        cancel.grid(column=1, row=4, columnspan=2, sticky='nes')
        self.run = Button(self, text='Run', state='disabled', command=self.onrun)
        self.run.grid(column=2, row=4, sticky='nesw', padx=(8, 0))
        self.columnconfigure(1, weight=1)
        self.center()
    
    def add_field(self, r, name):
        def browse():
            path = filedialog.askdirectory(initialdir='.', mustexist=True)
            if path:
                svar.set(path)
                self.fields[name] = path
            if all(self.fields.values()):
                self.run.configure(state='normal')
        svar = StringVar()
        lbl = Label(self, text=self.fields[name])
        fld = Entry(self, width=60, state='readonly', textvariable=svar)
        btn = Button(self, text='Browse', command=browse)
        lbl.grid(column=0, row=r, sticky='w', pady=(0, 16))
        fld.grid(column=1, row=r, sticky='nesw', padx=8, pady=(0, 16))
        btn.grid(column=2, row=r, sticky='nesw', pady=(0, 16))
    
    def center(self):
        self.update_idletasks()
        w = self.winfo_reqwidth() / 2
        h = self.winfo_reqheight() / 2
        wscreen, hscreen = self.maxsize()
        self.geometry(f'+{int(wscreen / 2 - w)}+{int(hscreen / 2 - h)}')
    

class ProgressFrame(Frame):
    def __init__(self, master, tocs):
        super().__init__(master, padding=16)
        self.master = master
        self.tocs = tocs
        pbval = IntVar()
        self.pb = Progressbar(self, maximum=len(tocs), variable=pbval)
        self.pb.pack(expand=True, fill='x', pady=(0, 16))
        self.pbval = property(pbval.get, pbval.set)
        self.build_table()
        self.close = Button(self, text='Close', command=self.master.destroy)
        self.close.grid(column=0, row=2, pady=16)
        self.layout()
    
    def layout(self):
        self['width'] = self.master.winfo_reqwidth()
        self['height'] = self.master.winfo_reqheight()
        # charw = nametofont('TkDefaultFont').measure('0')
        # ACTUALLY, DO THIS:
        # TRY USING TWO LISTBOXES, SIDE-BY-SIDE, INSIDE OF A FRAME
        # TREEVIEW IS TOO HARD TO CONFIGURE, SIZE-WISE
    
    def build_table(self):
        self.table = Treeview(self, height=len(self.tocs),
                              selectmode='none', show='headings')
        self.table.column('tocs', )
        self.table.heading('tocs', text='TOCs')
        self.table.column('status', )
        self.table.heading('status', text='Status')
        self.table.pack(expand=True, fill='both')
        for toc in self.tocs:
            self.table.insert('', 'end', toc, values=(toc, ''))
    
    def update(self, status, iid):
        self.table.set(iid, 'status', status)
        self.pbval += 1
        if self.pbval == self.pb.maximum:
            self.close.configure(state='normal')

class Module:
    def __init__(self, toc):
        self.path = toc
        self.dqid = re.match(r'^[^. ]+', toc.rpartition(sep)[2]).group()
        self.docs = [self.dqid]
    
    def scrape(self):
        with open(self.path, 'rb') as f:
            txt = '\n'.join(pg.extractText() for pg in Reader(f).pages)
        txt = re.sub(r' (?=\d{5})', '', txt.split('Assembly Drawing')[1])
        for draw in drawre.finditer(txt):
            if draw not in self.docs:
                self.docs.append(draw[0])
    
    def build(self, out_path):
        # return True/False, so if False, controller knows to ask for missing files
        if exists(out_path):
            os.remove(out_path)
        pdf = Merger()
        for child in self.docs:
            pdf.append(child)
        pdf.write(out_path)
    

if __name__ == '__main__':
    app = BuildModulesApp()
    app.launch_form()
    app.mainloop()
