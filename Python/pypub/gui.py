import wx
from wxbutton import Button
from dirpicker import DirPicker

# TODO: check spacing/layout
# TODO: figure out quitting actions
# TODO: add app.py handler func for tracking field values

class PypubGUI(wx.Frame):
    
    def __init__(self, title):
        super().__init__(None, title=title)
        self.Font = wx.Font(wx.FontInfo(12).Family(wx.MODERN))
        self.Bind(wx.EVT_CHAR_HOOK, self.onChar)
    
    def bindClose(self, closeFunc):
        self.Bind(wx.EVT_CLOSE, closeFunc)
    
    def initGUI(self, colors):
        self.colors = colors
        self.BackgroundColour = self.colors['bg']
        self.ForegroundColour = self.colors['fg']
        self.sizer = wx.BoxSizer(wx.VERTICAL)
    
    def addRow(self, name, label, val, dirCallback=None):
        picker = DirPicker(self,
                           labelText = label + ' Folder',
                           initValue = val,
                           dialogTitle = f'Select the {label} folder',
                           name = name)
        picker.button.setColors(self.colors['butbg'])
        if dirCallback:
            picker.setCallback(dirCallback)
        self.sizer.Add(picker, 0, wx.EXPAND|wx.LEFT|wx.RIGHT, 16)
    
    def addActions(self, clickCallback):
        bsizer = wx.BoxSizer(wx.HORIZONTAL)
        bsizer.AddStretchSpacer()
        
        bquit = Button(self, 'Quit', 'bquit')
        bquit.setColors(self.colors['butbg'])
        bquit.Bind(wx.EVT_BUTTON, clickCallback())
        bsizer.Add(bquit, 0, wx.ALIGN_RIGHT)
        
        binit = Button(self, 'Run', 'binit')
        binit.setColors(self.colors['actbg'], self.colors['actfg'])
        binit.enable(False)
        bquit.Bind(wx.EVT_BUTTON, clickCallback())
        bsizer.Add(binit, 0)
        self.sizer.Add(bsizer, 0, wx.EXPAND)
    
    def setInitCallback(self, initFunc):
        self.onInit = initFunc
    
    def setQuitCallback(self, quitFunc):
        self.onQuit = quitFunc
    
    def getFields(self):
        # may not even be necessary if I use callbacks
        pass
    
    def addQuit(self, button):
        button.setColors(self.colors['butBg'])
        self.hsizer.Add(button, 0, wx.EXPAND|wx.ALIGN_RIGHT)
    
    def addInit(self, button):
        button.setColors(self.colors['actBg'], self.colors['actFg'])
        button.enable(False)
        self.hsizer.Add(button, 0, wx.EXPAND)
    
    def quit(self):
        if self.onQuit:
            self.onQuit()
        self.Destroy()
    
    def onChar(self, evt):
        key = chr(evt.KeyCode)
        mod = evt.GetModifiers()
        if mod == wx.MOD_CONTROL and chr(key) in 'Qq':
            self.quit()
        evt.DoAllowNextEvent()
    
