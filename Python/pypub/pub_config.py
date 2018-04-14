from wx import Colour
from pathlib import Path

configfile = Path(__file__).parent.resolve() / 'config'
pubdirs = (
    ('indd', 'InDesign Folder'),
    ('pdfs', 'PDFs Folder'),
    ('draw', 'Drawings Folder'),
    ('proj', 'Project Folder')
)

def colors(color_name=None):
    color_dict = {
        'bg': wx.Colour(238, 238, 238),
        'fg': wx.Colour(33, 33, 33),
        'fld_bg': wx.Colour(192, 192, 192),
        'but_bg': wx.Colour(224, 224, 224),
        'act_bg': wx.Colour(33, 150, 243),
        'act_fg': wx.Colour(255, 255, 255),
        'dis_bg': wx.Colour(209, 209, 209),
        'dis_fg': wx.Colour(177, 177, 177)
    }
    return color_dict if color_name else color_dict[color_name]

def load_dirs():
    opt_char, opts =  '=', {}
    dir_list = []
    if configfile.exists():
        lines = configfile.read_text().splitlines()
        for line in lines:
            key, val = line.split(opt_char, 1)
            opts[key.strip()] = val.strip()
    for name, label in pubdirs:
        dir_opts = (name, label, opts.get(name, ''))
        dir_list.append(dir_opts)
    return dir_list

def dump_dirs(dirtext):
    dirtext = ''.join(dirtext)
    configfile.write_text(dirtext)
