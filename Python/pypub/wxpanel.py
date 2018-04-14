import wx
from wxbutton import PubButton

# tval unnecessary with Value property instead of get/set
# shit. set wx.BORDER_NONE and wxTAB_TRAVERSAL for every window
# does bgcolor propogate if setbgcolor method isn't used

class PubField:
    
    def __init__(self, parent):
        self.parent = parent
        self.sizer = wx.GridBagSizer(12, 12)
    
    def make_input(self, init_val=None, init_size=None):
        self.button = wx.PubButton(frame, 'Browse', self.name)
        self.text = wx.TextCtrl(frame, -1, style=wx.TE_READONLY)
        self.textln = wx.Panel(frame, -1, size=(-1, 1))
        self.tsizer = wx.BoxSizer(wx.VERTICAL)
        self.tsizer.Add(self.text, 0, wx.EXPAND)
        self.tsizer.Add(self.textln, 0, wx.EXPAND)
    
    def wxinit(self, val, border_bg, name):
        self.row = self.parent.num_rows()
        self.button.Bind(wx.EVT_BUTTON, self._get_dir)
        self.sizer.Add(self.label, (r, 0), (1, 2))
        self.sizer.Add(self.tsizer, (r + 1, 0), (1, 2), wx.EXPAND)
        self.sizer.Add(self.button, (r + 1, 2), flag=wx.EXPAND)
        self.text.SetTransparent(0)
        # self.text.BackgroundColour = self.frame.back_color
        self.textln.BackgroundColour = wx.Colour(192, 192, 192)
        self.button.BackgroundColour = self.frame.gray_color
    
    def build_field(self, init_val, bgcolor):
        self.field = wx.Panel(self)
        self.field.BackgroundColour = bgcolor
        self.field_sizer = wx.BoxSizer()
        self.text = wx.TextCtrl(self.field, value=init_val, style=wx.TE_READONLY|wx.TE_DONTWRAP)
        self.field_sizer.Add(self.text, 1, wx.EXPAND|wx.BOTTOM, 1)
        if init_val:
            self.text.MinSize = (self.text.CharWidth * len(init_val), -1)
        # set field bg to given color
        # use python builtin property function to move textctrl value to self
        # run test to see what happens if i use panel with no sizer
        # confirm sure setting textctrl inside panel with 1px bottom border
#        self.border = wx.Panel(self.parent, size=(-1, 1))
#        self.tsizer = wx.BoxSizer(wx.VERTICAL)
#        self.tsizer.Add(self.text, 0, wx.EXPAND)
#        self.tsizer.Add(self.textln, 0, wx.EXPAND)
    
    def value(self, new_val=None):
        if new_val:
            self.text.Value = new_val
        return self.text.Value
        