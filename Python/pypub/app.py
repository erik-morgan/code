import gui
import pub_config as config
import pypub
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
        # Progress Steps:
        #   Parsing outline...
        #   Checking for files...
        #   Building manual...
        #       Processing RP####
        #   Assembling manual...
        # pass fields to pypub init function
        # then begin phase 2 (progress window and 
        # error dialog listing missing files)
    
    def onquit(self):
        fields = self.mainframe.pack_fields()
        if set(fields) != set(self.dirs):
            config.dump_dirs('\n'.join(fields))
    
    def onerror(self):
        # raise error dialog listing missing files
        

if __name__ == '__main__':
    app = PypubApp()
    