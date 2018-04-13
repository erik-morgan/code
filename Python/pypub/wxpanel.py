import wx
from wxbutton import PubButton

# tval unnecessary with Value property instead of get/set
# 
# 
# 
# 

class PubField:
    
    def __init__(self, parent, name, label):
        self.name = name
        self.parent = parent
        self.sizer = frame.sizer
        self.label = wx.StaticText(frame, -1, label=label)
        # try wx.TRANSPARENT_WINDOW for self.text
        self.button = wx.PubButton(frame, 'Browse', label[0:-7])
    
    def make_input(self, init_val=None, init_size=None):
        self.text = wx.TextCtrl(frame, -1, style=wx.TE_READONLY)
        self.textln = wx.Panel(frame, -1, size=(-1, 1))
        self.tsizer = wx.BoxSizer(wx.VERTICAL)
        self.tsizer.Add(self.text, 0, wx.EXPAND)
        self.tsizer.Add(self.textln, 0, wx.EXPAND)
    
    def wxinit(self):
        self.button.Bind(wx.EVT_BUTTON, self._get_dir)
        r = self.frame.num_rows()
        self.sizer.Add(self.label, (r, 0), (1, 2))
        self.sizer.Add(self.tsizer, (r + 1, 0), (1, 2), wx.EXPAND)
        self.sizer.Add(self.button, (r + 1, 2), flag=wx.EXPAND)
        self.text.SetTransparent(0)
        # self.text.BackgroundColour = self.frame.back_color
        self.textln.BackgroundColour = wx.Colour(192, 192, 192)
        self.button.BackgroundColour = self.frame.gray_color
    
