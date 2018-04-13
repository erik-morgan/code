from pathlib import Path
from inspect import ismethod
from pubdir import PubDir
from wxbutton import PubButton
import config
import wx

class Pypub(wx.Frame):
    # b.SetToolTipString("This is a BIG button...")
    # 
    # class MyPanel(wx.Panel):
    #     """This Panel does some custom thing"""
    #     def __init__(self, *args, **kwargs):
    #         """Create the DemoPanel."""
    #         wx.Panel.__init__(self, *args, **kwargs)
    # 
    # dont use c++ getters/setters; use object properties
    # 
    # 
    # 
    
    def __init__(self):
        super().__init__(None, title='pypub')
        self.font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'Pypub')
        self.SetFont(self.font)
        self.BackgroundColour = config.colors('bg')
        self.ForegroundColour = config.colors('fg')
        atentry = (wx.ACCEL_CTRL, ord('Q'), self.bquit.Id)
        self.AcceleratorTable = wx.AcceleratorTable((wx.ACCEL_CTRL, ord('Q'), self.bquit.Id))
        self.init_gui()
        self.Show()
    
    def init_gui(self):
        self.sizer = wx.GridBagSizer(12, 12)
        self.indd = PubDir(self, 'indd', 'InDesign Folder')
        self.pdfs = PubDir(self, 'pdfs', 'PDFs Folder')
        self.draw = PubDir(self, 'draw', 'Drawings Folder')
        self.proj = PubDir(self, 'proj', 'Project Folder')
        if self.config.exists():
            self.load_dirs()
        self.idir('wxinit', True)
        self._add_ctrls()
        self.sizer.AddGrowableCol(0)
        self.sizer.AddGrowableRow(self.num_rows())
        # TODO: check spacing/layout
    
    def init_app(self):
        self.save_dirs()
        self.parent.mainloop()
    
    def quit_app(self):
        self.save_dirs()
        self.Destroy()
    
    def num_rows(self):
        return self.sizer.EffectiveRowsCount
    
    def _add_ctrls(self):
        row = self.num_rows()
        self.bquit = PubButton(self, -1, 'Quit')
        self.bquit.BackgrohndColour = self.gray_color
        self.sizer.Add(self.bquit, (row, 1), flag=wx.EXPAND)
        self.binit = PubButton(self, -1, 'Run', True)
        self.sizer.Add(self.binit, (row, 2), flag=wx.EXPAND)
        self.bquit.Bind(wx.EVT_BUTTON, self.quit_app)
        self.binit.Bind(wx.EVT_BUTTON, self.init_app)
        self.eval_state()
    
    # def eval_state(self):
    #     state = self.binit.Enabled
    #     if all(self.idir('tval', True)) != state:
    #         self.binit.Enable(not state)
    #         back, fore = self.bcolors[state]
    #         self.binit.BackgroundColour = back
    #         self.binit.ForegroundColour = fore
    
    def load_dirs(self):
        with self.config.open() as f:
            lines = [ln.split('=', maxsplit=1) for ln in f]
        try:
            self.dirs = {k.strip():v.strip() for k, v in lines}
        except ValueError:
            return
        dc = wx.WindowDC(self)
        attrs = dc.GetFullTextExtent(max(self.dirs.values()), font=self.font)
        for d in self.idir():
            d.tval(self.dirs[d.name])
            d.text.SetMinSize((attrs[0] * 1.1, -1))
    
    def save_dirs(self):
        if not self.dirs or set(self.idir('tval')) != set(self.dirs.values()):
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
    app = wx.App(redirect=False)
    app_obj = Pypub()
