import wx
from wxbutton import PubButton
from wxfield import TextField

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
        self.colors = kwargs.pop('colors')
        self.oninit = kwargs.pop('oninit', None)
        self.onquit = kwargs.pop('oninit', None)
        super().__init__(None, *args, **kwargs)
        self.BackgroundColour = self.colors['bg']
        self.ForegroundColour = self.colors['fg']
        self.Font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'Pypub')
        self.Bind(wx.EVT_CHAR_HOOK, self.onchar)
        self.Bind(wx.EVT_CLOSE, self.onquit)
    
    def build_gui(self, dirs_list, colors):
        self.sizer = wx.GridBagSizer(12, 12)
        button_map = {}
        for name, label, val in dirs_list:
            self.build_label(label)
            self.build_field(val, 'f' + name)
            self.build_browse(colors, 'b' + name)
            
        self.sizer.AddGrowableCol(0)
        self.sizer.AddGrowableRow(self.row_num() + 1)
        self.Show()
        # TODO: check spacing/layout
    
    def build_label(self, label_text):
        label = wx.StaticText(self, label_text, style=wx.ALIGN_LEFT)
        self.sizer.Add(label, (row_num(), 0))
    
    def build_field(self, value, name):
        field = TextField(self, value, name, True)
        self.sizer.Add(field, (row_num(), 0), (1, 2))
    
    def build_browse(self, colors, name=None):
        # either use a function to return an event handler with the specified input
        # or create a dict mapping button ids to fields
        button = PubButton(colors=colors, name=name)
        button.Bind(wx.EVT_BUTTON, self.browse_dir)
        self.sizer.Add(field, (row_num() - 1, 0), (1, 2))
    
    def browse_dir(self, evt):
        # button browse code & wx.Window.FindWindowByName(name)
    
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
    
    # def idir(self, attr_name=None, incl_proj=False):
    #     idirs = [self.indd, self.pdfs, self.draw]
    #     if incl_proj:
    #         idirs.append(self.proj)
    #     for d in idirs:
    #         if attr_name:
    #             attrib = getattr(d, attr_name)
    #             yield attrib() if ismethod(attrib) else attrib
    #         else:
    #             yield d
    
    def onchar(self, evt):
        key = chr(evt.KeyCode)
        mod = evt.GetModifiers()
        if mod == wx.MOD_CONTROL and chr(key) in 'Qq':
            self.quit_app()
        evt.DoAllowNextEvent()
