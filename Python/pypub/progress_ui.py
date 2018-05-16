import wx
from progressbar import ProgressBar
from mdbutton import MDButton

# Full List of Steps
# Parsing Outline:
#     do progress dialog with determinate progress bar
#     make the steps max the number of sections in outline
#     close/clear the dialog
# make checking files a single step
# do another progress dialog/guage:
#     for each unit in xml tree, change message
#     Processing Unit #/##: SS0264...
# Assembling manual...
# Saving [sm name (same as proj folder)]

class ProgressDialog(wx.Dialog):
    '''
    Add phases to app
    Absorb progressbar back into progress_ui
    Add total/phase progressbars to progress_ui
    Calculate subincrements for total progressbar
    '''
    def __init__(self, parent):
        super().__init__(self, None)
        self.Font = parent.Font
        self.BackgroundColour = parent.BackgroundColour
        self.ForegroundColour = parent.ForegroundColour
        self.sizer = wx.BoxSizer(wx.VERTICAL)
        self.MinSize = (wx.SystemSettings().GetMetric(wx.SYS_SCREEN_X) / 5, -1)
        self.MaxSize = (parent.Size.Width, -1)
        self.addAbort(parent.colors.get('but_bg', wx.NullColour))
    
    def closeHandler(self, evt):
        confirm = wx.MessageBox('Are you sure you want to abort?', 'Confirm', wx.YES_NO|wx.CANCEL)
        if confirm == wx.YES:
            self.onAbort()
    
    def addBar(self, message, steps):
        bar = ProgressBar(message, steps)
#        self.sizer.Insert(self.sizer.ItemCount - 1, bar, 0, wx.EXPAND|wx.LEFT|wx.TOP|wx.Right, 16)
        self.sizer.Insert(-2, bar, 0, wx.EXPAND|wx.LEFT|wx.TOP|wx.Right, 16)
        self.bars.append(bar)
        return bar
    
    def addAbort(self, bgcolor):
        abort = MDButton(self, 'Abort')
        abort.setColors(bgcolor)
        abort.Bind(wx.EVT_BUTTON, lambda e: self.Close())
        self.sizer.Add(abort, 0, wx.CENTER|wx.ALIGN_CENTER|wx.ALL, 16)
    
    def raiseDialog(self, onAbort=None):
        self.onAbort = onAbort
        self.Bind(wx.EVT_CLOSE, self.closeHandler)
        self.SetSizerAndFit(self.sizer)
        self.CentreOnParent()
        self.ShowWindowModal()
    
