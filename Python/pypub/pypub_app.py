from pathlib import Path
from tkinter import Tk, StringVar, ttk, filedialog
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
        init_gui()
    
    def init_gui(self):
        self.frame = ttk.Frame(self.parent, padding=24)
        self.frame.grid(column=0, row=0, sticky='nesw')
        self.frame.columnconfigure(0, weight=1)
        self.frame.rowconfigure(0, weight=1)
        self.indd.tkinit(self.frame, 'InDesign Folder', can_run)
        self.pdfs.tkinit(self.frame, 'PDFs Folder', can_run)
        self.draw.tkinit(self.frame, 'Drawings Folder', can_run)
        self.proj.tkinit(self.frame, 'Project Folder', can_run)
        # 
        indd_label = ttk.Label(self.frame, text='InDesign Folder:')
        indd_label.grid(column=0, row=0, sticky='w', padx=12)
        indd_entry = ttk.Entry(self.frame, textvariable=self._indd, state='readonly')
        indd_entry.grid(column=1, row=0, columnspan=3, sticky='ew')
        indd_button = ttk.Button(self.frame, text='Browse', command=set_indd)
        indd_button.grid(column=4, row=0, sticky='we')
        run_app = ttk.Button(self.frame, text='Run', command=run)
        # set minwidths on columns
    
    def run_app(self):
        if not self.dirs or set(self.idir('svar')) != set(self.dirs.values()):
            self.save_dirs()
    
    def can_run():
        run_bool = self.run_app['state'] == 'normal'
        if all(self.idir('svar', True)) != run_bool:
            self.run_app['state'] = self._state[not run_bool]
    
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
        s = ttk.Style()
        s.theme_create('dq', parent = 'alt')
        s.theme_use('alt')
        s.configure('dq.TButton', borderwidth=0)
    
#    def pick_dir(self, dir_obj):
#        # check what happens if user cancels
#        # remember to check status of all entrys to enable run button
#        # and denote required fields with red asterisks, and put legend/note at bottom
#        def ret_func():
#            dir_obj.get_dir()
#            if all(d.svar() for d in [self.indd, self.pdfs, self.draw, self.proj])
