import wx
from wxbutton import PubButton
from wxfield import TextField

# NOTES:
# Remove panel and use boxsizers. Current setup segfaulted in tests
# TODO: check spacing/layout

class PypubGUI(wx.Frame):
    
    def __init__(self, title, on_click):
        self.on_click = on_click
        super().__init__(None, title=title)
        self.Font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'Pypub')
        self.Bind(wx.EVT_CHAR_HOOK, self.onchar)
        self.Bind(wx.EVT_CLOSE, self.on_quit)
    
    def init_gui(self, colors):
        self.colors = colors
        self.BackgroundColour = colors['bg']
        self.ForegroundColour = colors['fg']
        self.sizer = wx.BoxSizer(wx.VERTICAL)
    
    def build_gui(self, dirs_list):
        self.fields = []
        for name, label, val in dirs_list:
            self.row_sizer = wx.BoxSizer(wx.HORIZONTAL)
            self.row_sizer.AddSpacer(16)
            self.build_row(name, label, val)
            self.row_sizer.AddSpacer(16)
            self.sizer.Add(self.vsizer, 0, wx.EXPAND)
        self.hsizer = wx.BoxSizer(wx.HORIZONTAL)
        self.hsizer.AddStretchSpacer(1)
        self.build_button('Quit', 'bquit', self.on_click, self.add_quit)
        self.hsizer.AddSpacer(8)
        self.build_button('Run', 'binit', self.on_click, self.add_init)
        self.hsizer.AddSpacer(16)
        self.sizer.Add(self.hsizer, 0, wx.EXPAND)
        self.sizer.Add((-1, 16), 1, wx.EXPAND)
    
    def build_row(self, name, label, value):
        self.vsizer = wx.BoxSizer(wx.VERTICAL)
        self.vsizer.AddSpacer(16)
        self.build_label(label)
        self.vsizer.AddSpacer(8)
        self.hsizer = wx.BoxSizer(wx.HORIZONTAL)
        self.build_field(value, 'f' + name)
        self.hsizer.AddSpacer(8)
        self.build_button('Browse', 'b' + name, self.browse)
        self.vsizer.Add(self.hsizer, 0, wx.EXPAND)
    
    def build_label(self, label_text):
        label = wx.StaticText(self, label_text, style=wx.ALIGN_LEFT)
        self.vsizer.Add(label, 1)
    
    def build_field(self, value, name):
        field = TextField(self, value, name, True)
        self.hsizer.Add(field, 1, wx.EXPAND)
        self.fields.append(field)
    
    def build_button(self, label, name, handler, callafter=None):
        button = PubButton(self, label=label, name=name)
        button.Bind(wx.EVT_BUTTON, handler)
        if not callafter:
            callafter = self.add_browse
        callafter(button)
    
    def add_browse(self, button):
        button.set_colors(self.colors['but_bg'])
        self.hsizer.Add(button, 0, wx.EXPAND)
    
    def add_quit(self, button):
        button.set_colors(self.colors['but_bg'])
        self.hsizer.Add(button, 0, wx.EXPAND|wx.ALIGN_RIGHT)
    
    def add_init(self, button):
        button.set_colors(self.colors['act_bg'], self.colors['act_fg'])
        button.enable(False)
        self.hsizer.Add(button, 0, wx.EXPAND)
    
    def browse(self, evt):
        dirdlg = wx.DirSelector()
        if dirdlg:
            fname = 'f' + evt.EventObject.Name[1:]
            wx.Window.FindWindowByName(fname).value = dirdlg
        evt.Skip()
    
    def onchar(self, evt):
        key = chr(evt.KeyCode)
        mod = evt.GetModifiers()
        if mod == wx.MOD_CONTROL and chr(key) in 'Qq':
            self.on_click()
        evt.DoAllowNextEvent()
    
    def pack_fields(self):
        field_list = []
        for field in self.fields:
            field_list.append(f'{field.name}={field.value}')
        return field_list
    
    