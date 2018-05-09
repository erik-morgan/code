# if this doesn't work, inherit from wx.Window

class ViewConfig:
    
    def __init__(self):
        self.colors = property()
        swatch = {
            'bg': (238, 238, 238),
            'fg': (33, 33, 33),
            'butbg': (224, 224, 224),
            'actbg': (33, 150, 243),
            'actfg': (255, 255, 255),
            'disbg': (209, 209, 209),
            'disfg': (177, 177, 177)
        }
    
    def getColors(self):
        return (self.BackgroundColour, self.ForegroundColour)
    
    def setColors(self, bg, fg=None):
        if not fg:
            bg, fg = bgOrColors
        