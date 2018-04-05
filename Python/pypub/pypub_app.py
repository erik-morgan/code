from pathlib import Path
from tkinter import Tk, StringVar, ttk, filedialog
import pypub

class Pypub:
        
    def __init__(self, parent):
        self.indd = {'var': StringVar()}
        self.pdfs = {'var': StringVar()}
        self.draw = {'var': StringVar()}
        self.proj = {'var': StringVar()}
        self.config = Path(__file__).parent.resolve() / 'config'
        if self.config.exists():
            self.load_dirs()
        self.parent = parent
        self.parent.title('pypub')
        init_gui()
    
    def init_gui():
        self.mainframe = ttk.Frame(self.parent, padding=24)
        self.mainframe.grid(column=0, row=0, sticky='nesw')
        self.mainframe.columnconfigure(0, weight=1)
        self.mainframe.rowconfigure(0, weight=1)
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
        self.indd.set(filedialog.askdirectory())
    
    def run(self):
        # save on cancel as well
        pass
    
    def loaddirs(self):
        with self._config.open() as f:
            items = [ln.split('=', maxsplit=1) for ln in f]
        dirs = {k.strip():v.strip() for k, v in items}
        self.indd['var'].set(dirs['indd'])
        self.pdfs['var'].set(dirs['pdfs'])
        self.draw['var'].set(dirs['draw'])
    
    def savedirs(self):
        # try this instead:
        # dirs = {
        #     'indd': {
        #         'var': StringVar(),
        #         'label': ,
        #         'entry': ,
        #         'button': 
        #     }
        # }
        # dirs['indd']['var']
        # 
        # OR write quick little dir class
        # 
        # 
        # 
        items = '\n'.join('='.join(item) for item in self.dirs.items())
        self._config.write_text(items)
    
    def make_style():
        s = ttk.Style()
        s.theme_create('dq', parent = 'alt')
        s.theme_use('alt')
        s.configure('dq.TButton', borderwidth=0)

    
    # pdfs_label = 
    # draw_label = 
    # proj_label = 
    # for child in mainframe.winfo_children(): child.grid_configure(padx=5, pady=5)
    # feet_entry.focus()
    # root.bind('<Return>', calculate)
    # w.mainloop()
