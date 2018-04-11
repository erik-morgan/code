from wx.lib.buttons import GenButton
from wx import Colour

class PubButton(GenButton):
    
    back = wx.Colour(224, 224, 224)
    text = wx.Colour(33, 33, 33)
    dis_back = wx.Colour(209, 209, 209)
    dis_text = wx.Colour(177, 177, 177)
    
    def __init__(self, parent, label, action=False):
        super().__init__(parent, -1, label)
        self.BackgroundColour = self.back
        self.ForegroundColour = self.text
        if action:
            self.Enable(False)
            self.back = wx.Colour(33, 150, 243)
            self.text = wx.Colour(255, 255, 255)
    
    # b.SetToolTipString("This is a BIG button...")
    
    