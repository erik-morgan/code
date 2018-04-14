import wx
from pubdir import PubDir
from wxbutton import PubButton

# NOTES:
# Panel AND TextCtrl don't inherit colors
# TextCtrl doesn't respond to transparency
# Currently lacking tabbed navigation
# style=wx.BORDER_NONE only removes physical border, not spacing
# 
# e = wx.TextCtrl(pnl, value=val, size=(min_size(val), -1), style=wx.TE_READONLY)
# e = wx.TextCtrl(f, value=val, style=wx.TE_READONLY)
# minw = round(f.CharWidth * len(val)) * 1.2
# e.SetInitialSize((minw, -1))
# Below works, above works, & MinSize = works with sizer
# e.SetInitialSize((min_size(val), -1))

class PypubGUI(wx.Frame):
    
    def __init__(self, *args, **kwargs):
        bgcolor = kwargs.pop('bgcolor', wx.NullColour)
        fgcolor = kwargs.pop('fgcolor', wx.NullColour)
        self.oninit = kwargs.pop('oninit', None)
        self.onquit = kwargs.pop('oninit', None)
        super().__init__(None, *args, **kwargs)
        self.BackgroundColour = bgcolor
        self.ForegroundColour = fgcolor
        self.Font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'Pypub')
        self.Bind(wx.EVT_CHAR_HOOK, self.on_char)
        self.Bind(wx.EVT_CLOSE, self.onquit)
    
    def build_gui(self, dirs_list, colors):
        self.sizer = wx.GridBagSizer(12, 12)
        for name, label, val in dirs_list:
            # set minsize of each item in dirs_list based on their own strings
            # eg if val: self.name.text (TextCtrl) MinSize = (self.name.text.CharWidth * len(self.name.text.Value), -1)
            self.build_label(label)
            o = PubField(name, label, val)
            setattr(self, 'b' + name, o)
        # RESUME HERE
        self.sizer.AddGrowableCol(0)
        self.sizer.AddGrowableRow(self.row_num() + 1)
        self.Show()
        # TODO: check spacing/layout
    
    def build_label(self, label_text):
        label = wx.StaticText(self, label_text, style=wx.ALIGN_LEFT)
        self.sizer.Add(label, (row_num(), 0), (1, 2))
    
    def build_field(self, val, bg):
        field = wx.Panel(self)
        field.BackgroundColour = bgcolor
        field_sizer = wx.BoxSizer()
        text = wx.TextCtrl(self, value=init_val, style=wx.TE_READONLY|wx.TE_DONTWRAP)
        field_sizer.Add(text, 1, wx.EXPAND|wx.BOTTOM, 1)
        if init_val:
            self.text.MinSize = (self.text.CharWidth * len(init_val), -1)
        self.sizer.Add(label, (row_num(), 0), (1, 2))
    
    def row_num(self):
        return self.sizer.EffectiveRowsCount
    
    def add_ctrls(self):
        row = self.row_num()
        self.bquit = PubButton(self, -1, 'Quit')
        self.bquit.BackgrohndColour = self.gray_color
        self.sizer.Add(self.bquit, (row, 1), flag=wx.EXPAND)
        self.binit = PubButton(self, -1, 'Run', True)
        self.sizer.Add(self.binit, (row, 2), flag=wx.EXPAND)
        self.bquit.Bind(wx.EVT_BUTTON, self.quit_app)
        self.binit.Bind(wx.EVT_BUTTON, self.init_app)
        self.eval_state()
    
    def text_size(self):
        dc = wx.WindowDC(self)
        attrs = dc.GetFullTextExtent(max(self.dirs.values()), font=self.Font)
        for d in self.idir():
            d.tval(self.dirs[d.name])
            d.text.SetMinSize((attrs[0] * 1.1, -1))
    
    def init_app(self):
        self.parent.mainloop()
    
    def quit_app(self):
        self.save_dirs()
        self.Destroy()
    
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
    
    def on_char(self, evt):
        key = chr(evt.KeyCode)
        mod = evt.GetModifiers()
        if mod == wx.MOD_CONTROL and chr(key) in 'Qq':
            self.quit_app()
        evt.DoAllowNextEvent()
    
#     def init_hotkey(self):
#         atentry = (wx.ACCEL_CTRL, ord('Q'), self.bquit.Id)
#         self.AcceleratorTable = wx.AcceleratorTable((wx.ACCEL_CTRL, ord('Q'), self.bquit.Id))
        
