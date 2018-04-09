import wx

class PubDir:
    def __init__(self, frame, dir_name, label):
        self.name = dir_name
        self.label = wx.StaticText(frame, -1, label=label)
        self.text = wx.TextCtrl(frame, -1, value=txtval, style=wx.TE_READONLY)
        self.textln = wx.Panel(frame, -1, size=(-1, 1))
        self.button = wx.Button(frame, label='Browse', name=label[0:-7])
        self.sizer = wx.FlexGridSizer(2, 2, 6, 12)
        self.tsizer = wx.BoxSizer(orient=wx.VERTICAL)
    
    def wxinit(self):
        self.button.Bind(wx.EVT_BUTTON, self._get_dir)
        self.tsizer.Add(self.text, 0, wx.EXPAND)
        self.tsizer.Add(self.textln, 0, wx.EXPAND)
        self.sizer.Add(self.label, 1)
        self.sizer.AddSpacer(0, 0)
        self.sizer.Add(self.tsizer, 1, wx.EXPAND)
        self.sizer.Add(self.button, 0, wx.EXPAND, 0)
        self.sizer.AddGrowableCol(0)
    
    def _get_dir(self, ev):
        dirdlg = wx.DirSelector()
        if dirdlg:
            self.text.SetValue(dirdlg)
        ev.Skip()
    
    def fsave(self):
        return f'{self.name}={self.tval()}\n'
    
    def tval(self, text_val=None):
        if text_val:
            self.text.SetValue(text_val)
        else:
            return self.text.GetValue()
