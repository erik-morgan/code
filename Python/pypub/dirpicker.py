import wx
from mdbutton import Button
from mdfield import TextField

# MAY NOT NEED UNIQUE NAMES WITH NEW DIRPICKER REFACTOR:
# if name != 'dirpicker':
#     self.name = name
# label.Name = getattr(self, 'name', 'label')

class DirPicker(wx.Panel):
    def __init__ (self, parent,
                  size = wx.DefaultSize,
                  style = wx.TAB_TRAVERSAL,
                  labelText = 'Select a directory:',
                  initValue = '',
                  buttonText = 'Browse',
                  dialogTitle = '',
                  startDir = '.',
                  tooltip = 'Browse to select a directory',
                  dialogClass = wx.DirDialog,
                  newDir = False,
                  name = 'dirpicker'):
        self.labelText = labelText
        self.initValue = initValue
        self.buttonText = buttonText
        self.tooltip = tooltip
        self.dialogTitle = dialogTitle
        self.startDir = startDir
        self.dialogClass = dialogClass
        self.newDir = newDir
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.font = parent.Font
        
        self.createDialog(parent, size, style, name)
        
    def createDialog(self, parent, size, style, name):
        super().__init__(self, parent, style=style, name=name)
        self.SetMinSize(size)
        
        vsizer = wx.BoxSizer(wx.VERTICAL)
        
        self.label = self.makeLabel()
        vsizer.Add(self.label, 0, wx.CENTER)
        
        hsizer = wx.BoxSizer(wx.HORIZONTAL)
        
        fieldSizer = self.makeField()
        hsizer.Add(fieldSizer, 1, wx.EXPAND)
        
        self.button = self.makeButton()
        hsizer.Add(self.button, 0, wx.RIGHT, 16)
        
        vsizer.Add(hsizer, 1, wx.EXPAND)
        vsizer.Fit(self)
        
        self.SetAutoLayout(True)
        self.SetSizer(vsizer)
        self.Layout()
        if instanceof(size, tuple):
            size = wx.Size(size)
        self.SetSize(-1, -1, size.width, size.height, wx.SIZE_USE_EXISTING)
    
    def onBrowse(self, ev=None):
        style = 0
        if not self.newDir:
            style |= wx.DD_DIR_MUST_EXIST
        dialog = self.dialogClass(self,
                                  message = self.dialogTitle,
                                  defaultPath = self.startDir,
                                  style = style)
        if dialog.ShowModal() == wx.ID_OK:
            self.SetValue(dialog.GetPath())
        dialog.Destroy()
    
    def makeLabel(self):
        label = wx.StaticText(self, -1, self.labelText, style=wx.ALIGN_LEFT)
        self.inheritAttrs(label)
        self.sizeText(label, self.labelText)
        return label
    
    def makeField(self):
        sizer = wx.BoxSizer(wx.VERTICAL)
        
        self.field = wx.TextCtrl(self, value=self.initValue)
        self.field.ToolTip = self.tooltip
        self.inheritAttrs(self.field)
        self.sizeText(self.field, self.initValue)
        sizer.Add(self.field, 0, wx.EXPAND)
        
        line = wx.Panel(self, size=(-1, 1))
        line.BackgroundColour = self.ForegroundColour
        sizer.Add(line, 0, wx.EXPAND)
        return sizer
    
    def makeButton(self):
        button = Button(self, self.buttonText)
        button.ToolTip = self.tooltip
        button.Bind(wx.EVT_BUTTON, self.onBrowse)
        return button
    
    def styleButton(self, bg, fg):
        self.button.setColors(bg, fg)
    
    def inheritAttrs(self, widget):
        widget.BackgroundColour = self.BackgroundColour
        widget.ForegroundColour = self.ForegroundColour
        widget.Font = self.Font
    
    def sizeText(self, widget, value):
        if not value:
            return (320, -1)
        w, h, d, e = self.GetFullTextExtent(value, self.Font)
        widget.MinSize = (round(w * 1.2), h)
    