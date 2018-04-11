import wx

class PubDir:
    def __init__(self, frame, dir_name, label):
        self.name = dir_name
        self.frame = frame
        self.sizer = frame.sizer
        self.label = wx.StaticText(frame, -1, label=label)
        # try wx.TRANSPARENT_WINDOW for self.text
        self.text = wx.TextCtrl(frame, -1, value=txtval, style=wx.TE_READONLY)
        self.textln = wx.Panel(frame, -1, size=(-1, 1))
        self.tsizer = wx.BoxSizer(orient=wx.VERTICAL)
        self.button = wx.Button(frame, label='Browse', name=label[0:-7])
    
    def wxinit(self):
        self.tsizer.Add(self.text, 0, wx.EXPAND)
        self.tsizer.Add(self.textln, 0, wx.EXPAND)
        self.button.Bind(wx.EVT_BUTTON, self._get_dir)
        r = self.frame.num_rows()
        self.sizer.Add(self.label, (r, 0), (1, 2))
        self.sizer.Add(self.tsizer, (r + 1, 0), (1, 2), wx.EXPAND)
        self.sizer.Add(self.button, (r + 1, 2), flag=wx.EXPAND)
        self.text.SetTransparent(0)
        # self.text.BackgroundColour = self.frame.back_color
        self.textln.BackgroundColour = wx.Colour(192, 192, 192)
        self.button.BackgroundColour = self.frame.gray_color
    
    def _get_dir(self, ev):
        dirdlg = wx.DirSelector()
        if dirdlg:
            self.tval(dirdlg)
        self.frame.eval_state()
        ev.Skip()
    
    def fsave(self):
        return f'{self.name}={self.tval()}\n'
    
    def tval(self, text_val=None):
        if text_val:
            self.text.SetValue(text_val)
        else:
            return self.text.GetValue()
