# 2018-09-23 00:36:11 #
from tkinter import BooleanVar, filedialog, StringVar, Tk
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
        self.form.pack(expand=True, fill='BOTH')
    
    def build_modules(self):
        self.dirs = self.form.dirs
        self.rmtocs = self.form.rmtocs.get()
        self.dims = (self.winfo_reqwidth(), self.winfo_reqheight())
        self.form.destroy()
        self.doclib = self.build_lib()
        self.pb = ProgressFrame(self, self.tocs)
        self.pb.pack(expand=True, fill='BOTH')
    
    def build_lib(self):
        rxlib = re.compile(r'(?:\d-|[a-z]{2,6})?\d{4,6}\b.+pdf', flags=re.I)
        rxtoc = re.compile(r'\bTOC.indd$', flags=re.I)
        self.tocs = self.iter_dir(['tocs'], rxtoc.search)
        # this is just a list of paths. convert it to dict
        # also, keep in mind that iter_dir will only be used twice: for tocs & doclib
        # RESUME HERE
        paths = list(self.iter_dir(['pdfs', 'dwgs'], rxlib.match))
    
    def iter_dir(self, dpath, pattern='*'):
        steps = (step[::2] for step in walk(self.dirs.get(dpath, dpath)))
        return {f'{path}{sep}{f}':f for path, files in steps
                                    for f in fnfilter(files, pattern)}
    

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
        self.pb = Progressbar(self, maximum=len(tocs))
        self.pb.grid(column=0, row=0, sticky='nesw', padx=16, pady=16)
        self.build_table()
        self.pb.step()
        self.close = Button(self, text='Close', command=self.quit)
        self.close.grid(column=0, row=2, pady=16)
        self.mainloop()
    
    def layout(self):
        # calculate widget sizes using root window geometry
        pass
    
    def build_table(self):
        self.table = Treeview(self, columns=('tocs', 'status'))
        self.table.heading('tocs', text='TOCs')
        self.table.heading('status', text='Status')
        self.table.grid(column=0, row=1, sticky='nesw', padx=16)
        self.row_ids = []
        for toc in self.tocs:
            self.row_ids.append(self.table.insert('', 'end', values=(toc, '')))
    
    def update(self, status):
        row_id = self.row_ids.pop(0)
        self.table.set(row_id, 'status', status)
        self.pb.step()
        if len(self.row_ids) == 0:
            self.close.configure(state='normal')

class Module:
    def __init__(self, toc):
        self.name, self.proc = re.search(r'.+/(([^. ]+).+)\.pdf',
                                         toc, flags=re.I).groups()
        self.elements = [toc, self.get_path(proc)]
    
    def build(self, out_path):
        for draw in self.scrape(toc_path):
            draw = self.get_path(draw)
            if draw not in self.elements:
                self.elements.append(draw)
        if exists(out_path):
            os.remove(out_path)
        pdf = Merger()
        for child in self.children:
            pdf.append(child)
        pdf.write(out_path)
    
    def scrape(self):
        with open(toc, 'rb') as f:
            txt = '\n'.join(pg.extractText() for pg in Reader(f).pages)
        txt = re.sub(r' (?=\d{5})', '', txt.split('Assembly Drawing')[1])
        for draw in drawre.finditer(txt):
            yield draw[0]
    
    def get_path(idnum):
        # check if idnum is in any of the libraries, and returns it if found
        pass
    

if __name__ == '__main__':
    app = BuildModulesApp()
    app.launch_form()
    app.mainloop()
