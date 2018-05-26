import wx
from mdbutton import MDButton

class DirPicker(wx.Panel):
    def __init__ (self, parent,
                  style = wx.TAB_TRAVERSAL,
                  labelText = 'Folder Path:',
                  initValue = '',
                  buttonText = 'Browse',
                  dialogTitle = 'Choose a folder',
                  pathCallback = None,
                  name = 'dirpicker'):
        super().__init__(parent, style=style, name=name)
        self.labelText = labelText
        self.initValue = initValue
        self.buttonText = buttonText
        self.dialogTitle = dialogTitle
        self.callback = pathCallback
        self.Font = parent.Font
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.createPicker()
    
    def createPicker(self):
        vsizer = wx.BoxSizer(wx.VERTICAL)
        self.label = self.makeLabel()
        vsizer.Add(self.label, 0, wx.TOP, 16)
        hsizer = wx.BoxSizer(wx.HORIZONTAL)
        hsizer.Add(self.makeField(), 1, wx.ALIGN_BOTTOM|wx.RIGHT, 16)
        self.button = self.makeButton()
        hsizer.Add(self.button, 0)
        vsizer.Add(hsizer, 0, wx.EXPAND|wx.TOP, 8)
        self.SetAutoLayout(True)
        self.SetSizerAndFit(vsizer)
        self.Layout()
    
    def makeLabel(self):
        label = wx.StaticText(self, -1, self.labelText, style=wx.ALIGN_LEFT)
        label.BackgroundColour = self.BackgroundColour
        self.sizeText(label, self.labelText)
        return label
    
    def makeField(self):
        self.field = wx.TextCtrl(self, value=self.initValue,
            style=wx.TE_READONLY|wx.BORDER_NONE)
        self.field.BackgroundColour = self.BackgroundColour
        self.field.ForegroundColour = self.ForegroundColour
        self.field.Font = self.Font
        self.field.SetCanFocus(False)
        self.field.ToolTip = f'Path to: {self.labelText}'
        self.sizeText(self.field, self.initValue)
        line = wx.Panel(self, size=(-1, 1))
        line.BackgroundColour = self.ForegroundColour
        sizer = wx.BoxSizer(wx.VERTICAL)
        sizer.Add(self.field, 1, wx.EXPAND)
        sizer.Add(line, 0, wx.EXPAND)
        return sizer
    
    def makeButton(self):
        button = MDButton(self, self.buttonText)
        button.ToolTip = f'Click to browse to: {self.labelText}'
        button.Bind(wx.EVT_BUTTON, self.onBrowse)
        return button
    
    def setCallback(self, callbackFunc):
        self.callback = callbackFunc
    
    def onBrowse(self, ev=None):
        dirPath = wx.DirSelector(self.dialogTitle, 
            style=wx.DD_DEFAULT_STYLE|wx.DD_DIR_MUST_EXIST)
        if dirPath:
            self.field.Value = dirPath
            if self.callback:
                self.callback(self.Name, dirPath)
    
    def sizeText(self, elem, value):
        width = self.CharWidth * (len(value) * 1.2 if value else 60) # (320, -1)
        elem.MinSize = (round(width), self.CharHeight * 1.2)
    