import wx
from wxbutton import PubButton
from wxfield import TextField

# NOTES:
# Panel AND TextCtrl don't inherit colors
# TextCtrl doesn't respond to transparency
# Currently lacking tabbed navigation
# style=wx.BORDER_NONE only removes physical border, not spacing
# i can load dirs after gui is built, but before mainloop is called
# TODO: check spacing/layout

class PypubGUI(wx.Frame):
    
    # FINISH REVERTING TO wx.Frame AND ADDING PANEL
    # Remove panel and use boxsizers. Current setup segfaulted in tests
    
    def __init__(self, *args, **kwargs):
        self.oninit = kwargs['oninit']
        self.onquit = kwargs['oninit']
        super().__init__(None, *args, **kwargs)
        self.Font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'Pypub')
        self.Bind(wx.EVT_CHAR_HOOK, self.onchar)
        self.Bind(wx.EVT_CLOSE, self.onquit)
    
    def init_gui(self, colors):
        self.colors = colors
        self.BackgroundColour = colors['bg']
        self.ForegroundColour = colors['fg']
        self.frame_sizer = wx.BoxSizer(wx.VERTICAL)
        self.panel = wx.Panel(self)
        self.panel.BackgroundColour = colors['bg']
        self.panel.ForegroundColour = colors['fg']
        self.frame_sizer.Add(self.panel, )
        self.sizer = wx.GridBagSizer(8, 8)
    
    def build_gui(self, dirs_list):
        self.fields = []
        for name, label, val in dirs_list:
            self.build_label(label)
            self.build_field(val, 'f' + name)
            self.build_button('Browse', 'b' + name, self.browse)
        self.build_button('Quit', 'bquit', self.onquit, self.add_quit)
        self.build_button('Run', 'binit', self.oninit, self.add_init)
        self.sizer.AddGrowableCol(0)
        self.sizer.Add(-1, 1, (self.row(), 0), (1, 3), wx.EXPAND)
        self.sizer.AddGrowableRow(self.row())
    
    def build_label(self, label_text):
        label = wx.StaticText(self, label_text, style=wx.ALIGN_LEFT)
        self.sizer.Add(label, (self.row(), 0))
    
    def build_field(self, value, name):
        field = TextField(self, value, name, True)
        self.sizer.Add(field, (self.row(), 0), (1, 2))
        self.fields.append(field)
    
    def build_button(self, label, name, handler, callafter=self.add_browse):
        button = PubButton(self, label=label, name=name)
        button.Bind(wx.EVT_BUTTON, handler)
        callafter(button)
    
    def add_browse(self, button):
        button.set_colors(self.colors['but_bg'])
        pos = (self.row() - 1, self.col() - 1)
        self.sizer.Add(button, pos, flag=wx.EXPAND)
    
    def add_quit(self, button):
        button.set_colors(self.colors['but_bg'])
        pos = (self.row(), self.col() - 2)
        self.sizer.Add(button, pos, flag=wx.EXPAND|wx.ALIGN_RIGHT)
    
    def add_init(self, button):
        button.set_colors(self.colors['act_bg'], self.colors['act_fg'])
        button.enable(False)
        pos = (self.row() - 1, self.col() - 1)
        self.sizer.Add(button, pos, flag=wx.EXPAND)
    
    def browse(self, evt):
        dirdlg = wx.DirSelector()
        if dirdlg:
            fname = 'f' + evt.EventObject.Name[1:]
            wx.Window.FindWindowByName(fname).value = dirdlg
        evt.Skip()
    
    def row(self):
        return self.sizer.EffectiveRowsCount
    
    def col(self):
        return self.sizer.EffectiveColsCount
    
    def onchar(self, evt):
        key = chr(evt.KeyCode)
        mod = evt.GetModifiers()
        if mod == wx.MOD_CONTROL and chr(key) in 'Qq':
            self.quit_app()
        evt.DoAllowNextEvent()
    
    def pack_fields(self):
        field_list = []
        for field in self.fields:
            field_list.append(f'{field.name}={field.value}')
        return field_list
    