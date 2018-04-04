from pathlib import Path
from tkinter import Tk, StringVar, ttk, filedialog
import pypub

class Pypub:
    _indd = StringVar()
    _pdfs = StringVar()
    _draw = StringVar()
    _proj = StringVar()
    _config = Path(__file__).parent.resolve() / 'config'
    #
    # make load and save options defs
    #
    def __init__(self, parent):
        self.parent = parent
        self.parent.title('pypub')
        self.mainframe = ttk.Frame(self.parent, padding=24)
        self.mainframe.grid(column=0, row=0, sticky='nesw')
        self.mainframe.columnconfigure(0, weight=1)
        self.mainframe.rowconfigure(0, weight=1)
        if self._config.exists():
            self.load_dirs()
            self._indd.set(self._dirs['indd'])
            self._pdfs.set(self._dirs['pdfs'])
            self._draw.set(self._dirs['draw'])
        indd_label = ttk.Label(mainframe, text='InDesign Folder:')
        indd_label.grid(column=0, row=0, sticky='w', padx=12)
        indd_entry = ttk.Entry(mainframe, textvariable=self._indd, state='readonly')
        indd_entry.grid(column=1, row=0, columnspan=3, sticky='ew')
        indd_button = ttk.Button(mainframe, text="Browse", command=set_indd)
        indd_button.grid(column=4, row=0, sticky='we')
        # set minwidths on columns
    
    def set_indd(self):
        # check what happens if user cancels
        # remember to check status of all entrys to enable run button
        # and denote required fields with red asterisks, and put legend/note at bottom
        self._indd.set(filedialog.askdirectory())
    
    def run(self):
        # save on cancel as well
        self._config.write_text(json.dumps(self.dirs, sort_keys=True, indent=4))
    
    def load_dirs(self):
        with self._config.open() as f:
            items = [ln.split('=', maxsplit=1) for ln in f]
        self._dirs = {k.strip():v.strip() for k, v in items}
    
    def save_dirs(self):
        items = '\n'.join('='.join(item) for item in self._dirs.items())
        self._config.write_text(items)
    
    
    
    # pdfs_label = 
    # draw_label = 
    # proj_label = 
    # for child in mainframe.winfo_children(): child.grid_configure(padx=5, pady=5)
    # feet_entry.focus()
    # root.bind('<Return>', calculate)
    # w.mainloop()
