from pathlib import Path
from tkinter import Tk
from tkinter.ttk import Frame, Style, Button
from inspect import ismethod
from pubdir import PubDir

class Pypub:
    _state = {
        True: 'normal',
        False: 'disabled'
    }
    
    def __init__(self, parent):
        self.indd = PubDir('indd')
        self.pdfs = PubDir('pdfs')
        self.draw = PubDir('draw')
        self.proj = PubDir('proj')
        self.config = Path(__file__).parent.resolve() / 'config'
        if self.config.exists():
            self.load_dirs()
        self.parent = parent
        self.parent.title('pypub')
        self.init_gui()
    
    def init_gui(self):
        self.frame = Frame(self.parent, padding=24)
        self.frame.grid(column=0, row=0, sticky='nesw')
        self.frame.columnconfigure(0, weight=1)
        self.frame.rowconfigure(0, weight=1)
        self.indd.tkinit(self.frame, 'InDesign Folder', self.can_run)
        self.pdfs.tkinit(self.frame, 'PDFs Folder', self.can_run)
        self.draw.tkinit(self.frame, 'Drawings Folder', self.can_run)
        self.proj.tkinit(self.frame, 'Project Folder', self.can_run)
        # 
        # indd_label = ttk.Label(self.frame, text='InDesign Folder:')
        # indd_label.grid(column=0, row=0, sticky='w', padx=12)
        # indd_entry = ttk.Entry(self.frame, textvariable=self._indd, state='readonly')
        # indd_entry.grid(column=1, row=0, columnspan=3, sticky='ew')
        # indd_button = ttk.Button(self.frame, text='Browse', command=set_indd)
        # indd_button.grid(column=4, row=0, sticky='we')
        self.b_run = Button(self.frame, text='Run', command=self.init_app)
        self.b_quit = Button(self.frame, text='Exit', command=self.frame.quit)
        # set minwidths on columns
    
    def init_app(self):
        if not self.dirs or set(self.idir('svar')) != set(self.dirs.values()):
            self.save_dirs()
        self.parent.mainloop()
    
    def can_run(self):
        run_bool = self.b_run['state'] == 'normal'
        if all(self.idir('svar', True)) != run_bool:
            self.b_run['state'] = self._state[not run_bool]
    
    def load_dirs(self):
        with self.config.open() as f:
            lines = [ln.split('=', maxsplit=1) for ln in f]
        self.dirs = {k.strip():v.strip() for k, v in lines}
        for d in self.idir():
            d.svar(self.dirs[d.name])
    
    def save_dirs(self):
        self.config.write_text(''.join(list(self.idir('svar'))))
    
    def idir(self, attr_name=None, incl_proj=False):
        idirs = [self.indd, self.pdfs, self.draw]
        if incl_proj:
            idirs.append(self.proj)
        for d in idirs:
            if attr_name:
                attrib = getattr(d, attr_name)
                yield attrib() if ismethod(attrib) else attrib
            else:
                yield d
    
    def make_style(self):
        # have to replace elements in layout with favorable ones
        # use clam theme as starting point, it is the best looking
        # s.configure('Test.TEntry')
        # e2['style'] = 'Test.TEntry'
        # s.theme_use(theme_name) changes real-time
        # see if there's a difference b/w Button/Label/Entry.padding, or if they're variations like Test.TEntry
        # there is no tkinter.Style()
        s = Style()
        s.theme_create('dq', parent = 'alt')
        s.theme_use('alt')
        s.configure('dq.TButton', borderwidth=0)
    
