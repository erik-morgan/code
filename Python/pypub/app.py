from pathlib import Path
from inspect import ismethod
from pubdir import PubDir
import wx

class Pypub:
    colors = {
        'back': wx.Colour(238, 238, 238),
        'text': wx.Colour(33, 33, 33),
        'line': wx.Colour(192, 192, 192),
        'gray': wx.Colour(224, 224, 224),
        True: (wx.Colour(33, 150, 243), wx.Colour(255, 255, 255)),
        False: (wx.Colour(209, 209, 209), wx.Colour(177, 177, 177))
    }
    
    def __init__(self):
        # Remember to bind Ctrl+Q to close
        self.frame = Frame(None, -1, 'pypub')
        self.font = wx.Font(16, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'PypubFont')
        self.frame.SetFont(self.font)
        self.frame.BackgroundColour = self.colors['back']
        self.frame.ForegroundColour = self.colors['text']
        self.indd = PubDir(self.frame, 'indd', 'InDesign Folder')
        self.pdfs = PubDir(self.frame, 'pdfs', 'PDFs Folder')
        self.draw = PubDir(self.frame, 'draw', 'Drawings Folder')
        self.proj = PubDir(self.frame, 'proj', 'Project Folder')
        self.config = Path(__file__).parent.resolve() / 'config'
        if self.config.exists():
            self.load_dirs()
        self.init_gui()
        self.frame.Show()
    
    def init_gui(self):
        self.sizer = wx.BoxSizer(orient=wx.VERTICAL)
        for adir in self.idir(None, True):
            adir.wxinit()
            adir.text.BackgroundColour = colors['back']
            adir.textln.BackgroundColour = colors['line']
            adir.button.BackgroundColour = colors['gray']
            adir.button.ForegroundColour = colors['text']
            self.sizer.Add(adir.sizer, wx.EXPAND)
        self._make_buttons()
        self.sizer.Add(hsizer, wx.EXPAND)
        self.frame.Bind(wx.EVT_BUTTON, self.eval_state)
        atentry = (wx.ACCEL_CTRL, ord('Q'), self.bquit.GetId())
        self.frame.SetAcceleratorTable(wx.AcceleratorTable([atentry]))
        # TODO: check spacing/layout
        # TODO: find a better way to organize this
    
    def init_app(self):
        if not self.dirs or set(self.idir('tval')) != set(self.dirs.values()):
            self.save_dirs()
        self.parent.mainloop()
    
    def quit_app(self):
        if not self.dirs or set(self.idir('tval')) != set(self.dirs.values()):
            self.save_dirs()
        self.frame.Destroy()
    
    def _make_buttons(self):
        hsizer = wx.BoxSizer(orient=wx.HORIZONTAL)
        self.bquit = wx.Button(self.frame, -1, label='Quit')
        hsizer.Add(self.bquit, 0, wx.ALIGN_RIGHT)
        hsizer.AddSpacer(12, -1)
        self.binit = wx.Button(self.frame, -1, label='Run')
        hsizer.Add(self.binit, 0, wx.ALIGN_RIGHT)
        self.bquit.Bind(wx.EVT_BUTTON, self.quit_app)
        self.binit.Bind(wx.EVT_BUTTON, self.init_app)
    
    def eval_state(self, ev):
        b = ev.EventObject
        state = self.binit.Enabled
        if b.Name != 'button' and all(self.idir('tval', True)) != state:
            self.binit.Enable(not state)
            back, fore = self.colors[state]
            self.binit.BackgroundColour = back
            self.binit.ForegroundColour = fore
    
    def load_dirs(self):
        with self.config.open() as f:
            lines = [ln.split('=', maxsplit=1) for ln in f]
        try:
            self.dirs = {k.strip():v.strip() for k, v in lines}
        except ValueError:
            return
        # get longest string, and pass that to calc_text_width
        dc = wx.WindowDC(self.frame)
        attrs = dc.GetFullTextExtent(max(dirs.values()), font=self.font)
        for d in self.idir():
            d.tval(self.dirs[d.name])
            d.text.SetMinSize((attrs[0] * 1.1, -1))
    
    def save_dirs(self):
        self.config.write_text(''.join(list(self.idir('fsave'))))
    
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
    
if __name__ == '__main__':
    app = wx.App()
    app_obj = Pypub()
