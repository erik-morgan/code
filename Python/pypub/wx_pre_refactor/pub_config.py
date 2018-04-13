from wx import Colour
from pathlib import Path

config = Path(__file__).parent.resolve() / 'config'

def colors(color_name=None):
    color_dict = {
        bg: wx.Colour(238, 238, 238),
        fg: wx.Colour(33, 33, 33),
        but_bg: wx.Colour(224, 224, 224),
        act_bg: wx.Colour(33, 150, 243),
        act_fg: wx.Colour(255, 255, 255),
        dis_bg: wx.Colour(209, 209, 209),
        dis_fg: wx.Colour(177, 177, 177)
    }
    return color_dict if color_name else color_dict[color_name]

def pubdirs():
    return (
        ('indd', 'InDesign Folder'),
        ('pdfs', 'PDFs Folder'),
        ('draw', 'Drawings Folder'),
        ('proj', 'Project Folder')
    )

def load_dirs():
    if config.exists():
        with config.open() as f:
            lines = [ln.partition('=') for ln in f]
        try:
            return {k.strip():v.strip() for k, e, v in lines}
        except ValueError:
            return

def save_dirs(dirtext):
    dirtext = ''.join(dirtext)
    config.write_text(dirtext)
