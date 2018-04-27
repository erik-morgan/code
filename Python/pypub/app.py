import gui
import pub_config as config
from pypub import Pypub
from send2trash import send2trash
import wx

class PypubApp:
    def __init__(self):
        self.app = wx.App()
        self.mainframe = gui.PypubGUI('pypub', self.oninit, self.onquit)
        self.mainframe.init_gui(config.colors())
        dir_list = config.load_dirs()
        self.dirs = [f'{d[0]}={d[2]}' for d in dir_list if d[0] != 'proj']
        self.mainframe.build_gui(dir_list)
    
    def oninit(self):
        fields = self.mainframe.pack_fields()
        self.mainframe.Destroy()
        pypub = Pypub(fields)
        pypub.parseOutline()
        pypub.fileCheck()
        # convert pypub functions to this_style from camelcase
        # probably going to need custom exception/error class
        # otherwise: if pypub displays error in messagebox, it can close
        # all the gui parts, but this function will continue
        send2trash(bytes(pypub.opub))
    
    def onquit(self):
        fields = self.mainframe.pack_fields()
        self.mainframe.Destroy()
        if set(fields) != set(self.dirs):
            config.dump_dirs('\n'.join(fields))
    
    def on_error(self, err_msg):
        wx.MessageBox(err_msg, 'Error', wx.OK)
    

if __name__ == '__main__':
    app = PypubApp()
    