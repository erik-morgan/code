import wx
from mdbutton import Button
from dirpicker import DirPicker

# TODO: check spacing/layout
# TODO: figure out quitting actions
# TODO: add app.py handler func for tracking field values

class PypubGUI:
    
    def __init__(self, title, colors):
        self.app = wx.App()
        self.frame = wx.Frame(None, title=title)
        self.colors = colors
        self.BackgroundColour = colors.get('bg', wx.NullColour)
        self.ForegroundColour = colors.get('fg', wx.NullColour)
        self.Font = wx.Font(wx.FontInfo(12).Family(wx.MODERN))
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.Bind(wx.EVT_CLOSE, self.onClose)
        self.Bind(wx.EVT_CHAR_HOOK, self.onChar)
    
    def initGUI(self):
        self.frame.SetSizerAndFit(self.sizer)
        self.frame.Show()
        self.app.MainLoop()
    
    def addRow(self, name, val, dirCallback=None):
        picker = DirPicker(self.frame,
                           labelText = name + ' Folder',
                           initValue = val,
                           dialogTitle = f'Select the {name} folder',
                           name = name)
        picker.button.setColors(self.colors['butbg'])
        if dirCallback:
            picker.setCallback(dirCallback)
        self.sizer.Add(picker, 0, wx.EXPAND|wx.LEFT|wx.RIGHT, 16)
    
    def addActions(self, callback):
        if wx.Window.FindWindowByName('bquit'):
            return
        self.callback = callback
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        
        bquit = Button(self.frame, 'Quit', 'bquit')
        bquit.setColors(self.colors.get('butbg'), wx.NullColour)
        bsizer.Add(bquit, 0, wx.ALIGN_RIGHT)
        
        binit = Button(self.frame, 'Run', 'binit')
        binit.setColors(self.colors.get('actbg', wx.NullColour),
                        self.colors.get('actfg', wx.NullColour))
        binit.enable(False)
        bsizer.Add(binit, 0)
        self.sizer.Add(bsizer, 0, wx.EXPAND|wx.LEFT|wx.TOP|wx.RIGHT, 16)
        
        bquit.Bind(wx.EVT_BUTTON, self.onQuit)
        binit.Bind(wx.EVT_BUTTON, self.onInit)
    
    def onQuit(self, evt):
        self.frame.Close()
    
    def onInit(self, evt):
        if self.callback:
            self.callback(True)
    
    def onClose(self, evt=None):
        if self.callback:
            self.callback(False)
        wx.CallAfter(self.frame.Destroy())
    
    def onChar(self, evt):
        key = chr(evt.KeyCode)
        mod = evt.GetModifiers()
        if mod == wx.MOD_CONTROL and chr(key) in 'Qq':
            self.frame.Close()
        evt.DoAllowNextEvent()
    
    # must either do onclose or bind close event for clicking x on window dec
    # add setOnClose and setOnInit methods
