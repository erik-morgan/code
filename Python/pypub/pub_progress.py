import wx
from wxbutton import PubButton

# Full List of Steps
# Parsing Outline:
#     do progress dialog with determinate progress bar
#     make the range max the number of sections in outline
#     close/clear the dialog
# make checking files a single step
# do another progress dialog/guage:
#     for each unit in xml tree, change message
#     Processing Unit #/##: SS0264...
# Assembling manual...
# Saving [sm name (same as proj folder)]

class PypubProgress(wx.Dialog):
    def __init__(self, colors, on_abort):
        super().__init__(self, None)
        self.colors = colors
        self.on_abort = on_abort
        self.BackgroundColour = self.colors['bg']
        self.ForegroundColour = self.colors['fg']
        self.Font = wx.Font(12, wx.MODERN, wx.NORMAL, wx.NORMAL, False, 'Pypub')
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.Bind(wx.EVT_CHAR_HOOK, self.on_key_press)
        self.Bind(wx.EVT_CLOSE, self.on_close)
    
    def init_win(self):
        self.add_message(msg)
        self.build_progress_bar()
        self.add_abort()
        self.SetSizerAndFit(self.sizer)
        self.Centre()
        self.ShowModal()
    
    def add_message(self, msg):
        self.message = wx.StaticText(self, label=msg, style=wx.ALIGN_LEFT)
        self.message.Size = (320, -1)
        self.sizer.Add(self.message, 0, wx.EXPAND|wx.ALL, 16)
    
    def build_progress_bar(self):
        self.prog_bar = wx.Panel(self, size=(288, 16))
        self.prog_bar.BackgroundColour = wx.Colour(171, 205, 237)
        self.sizer.Add(self.prog_bar, 0, wx.ALL, 16)
        self.prog = wx.Panel(self.prog_bar, pos=(0, 0), size=(0, -1))
        self.prog.BackgroundColour = wx.Colour(46, 134, 243)
    
    def add_abort(self):
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        self.abort = PubButton(self, label='Abort', name='abort')
        self.abort.set_colors(self.colors['but_bg'])
        self.abort.Bind(wx.EVT_BUTTON, self.on_close)
        bsizer.Add(self.abort, 0, wx.ALIGN_RIGHT)
        self.sizer.Add(bsizer, 1, wx.ALL|wx.EXPAND, 16)
    
    def on_key_press(self, evt):
        key = evt.KeyCode
        if evt.GetModifiers() == wx.MOD_CONTROL and chr(key) in ('Q', 'q'):
            self.Close()
        evt.DoAllowNextEvent()
    
    def on_close(self, evt):
        confirm = wx.MessageBox('Are you sure you want to abort?', 'Confirm', wx.YES_NO|wx.CANCEL)
        if confirm == wx.YES:
            self.on_abort('Operation aborted')
    
    def init_prog(self, msg, rng=1):
        self.set_msg(msg)
        self.set_rng(rng)
        if not self.Shown:
            self.init_win()
    
    def set_msg(self, msg_txt=''):
        self.msg.Label = msg_txt
    
    def set_rng(self, rng):
        self.range = rng
        self.prog_inc = self.prog_bar.Size.Width / rng
    
    def update(self, new_msg=None):
        if new_msg:
            self.set_msg(new_msg)
        self.prog.Size.Width += self.prog_inc
    
