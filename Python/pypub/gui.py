import wx
from wxbutton import PubButton
from wxfield import TextField

# TODO: check spacing/layout

class PypubGUI(wx.Frame):
    
    def __init__(self, title):
        super().__init__(None, title=title)
        self.Font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'Pypub')
        self.Bind(wx.EVT_CHAR_HOOK, self.on_char)
    
    def bind_close(self, close_func):
        self.Bind(wx.EVT_CLOSE, close_func)
    
    def init_gui(self, colors):
        for color_name in ['bg', 'fg', 'butbg', 'butfg', 'actbg', 'acfg']:
            color = colors.get(color_name, wx.NullColour)
            setattr(self, color_name, color)
        self.BackgroundColour = self.bg
        self.ForegroundColour = self.fg
        self.browse = wx.DirSelector
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.sizer.AddSpacer(16)
    
    def add_row(self, name, label, val):
        hsizer = wx.BoxSizer(wx.HORIZONTAL)
        self.fields.append(TextField(self, val, 'f' + name))
        hsizer.Add(self.fields[-1], 1, wx.RIGHT|wx.BOTTOM|wx.LEFT, 16)
        self.browsers.append(PubButton(self, 'Browse', 'b' + name, self.butbg))
        hsizer.Add()
            (PubButton('Browse', 'b' + name), 0, wx.RIGHT|wx.BOTTOM, 16)
        self.sizer.AddMany([
            (wx.StaticText(self, dir_label), 0, wx.EXPAND|wx.LEFT, 16) #, style=wx.ALIGN_LEFT
            ((-1, 8), 0, wx.EXPAND),
            
        ])
        row_sizer = wx.BoxSizer(wx.HORIZONTAL)
    
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
        self.row_sizer = wx.BoxSizer(wx.HORIZONTAL)
        self.row_sizer.AddSpacer(16)
            self.build_row(name, label, val)
            self.row_sizer.AddSpacer(16)
            self.sizer.Add(self.vsizer, 0, wx.EXPAND)
        self.vsizer = wx.BoxSizer(wx.VERTICAL)
        self.vsizer.AddSpacer(16)
        self.build_label(label)
        self.vsizer.AddSpacer(8)
        self.hsizer = wx.BoxSizer(wx.HORIZONTAL)
        self.build_field(value, 'f' + name)
        self.hsizer.AddSpacer(8)
        self.build_button('Browse', 'b' + name, self.browse)
        self.vsizer.Add(self.hsizer, 0, wx.EXPAND)
    
    def _add_field(self, value, name):
        field = TextField(self, value, name)
        self.fields.append(field)
        return field
    
    def _add_browse(self, label, name):
        button = PubButton(self, label, name, self.butbg)
        button.Bind(wx.EVT_BUTTON, self.browse)
    
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
    
    def on_char(self, evt):
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
    
    