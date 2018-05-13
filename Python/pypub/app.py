from gui import PypubGUI
from config import AppConfig
from exceptions import ConfigError
from send2trash import send2trash

# add clean_up function for aborted process
# add help dialog
# ALWAYS save the dirs when exiting the gui
# put callbacks in here; no need to send to GUI; test button names, and close from here
# still need closeCallback bc of ctrl+q
# ALSO validate colors, which means another freaking exception
# 
# SOLUTION IS TO PUT EVERYTHING ELSE INTO AN ELSE CLAUSE FOR TRY
# THAT WAY, THE APP WILL JUST END EXECUTION IF CONFIGERROR, AND
# MAINLOOP WILL ONLY BE INITIALIZED IF THERE IS NO CONFIGERROR
# ALTERNATIVES: subclass wx.App, or call wx.Exit if not in MainLoop
# apparently destroying the top window does NOT end execution;

class PypubApp:
    
    def __init__(self):
        self.config = AppConfig()
        self.view = PypubGUI('pypub', self.config.colors)
        try:
            self.config.loadDirs()
        except ConfigError as err:
            self.view.onError(err)
        else:
            for dirName, dirPath in self.config.dirs.items():
                self.view.addRow(dirName, dirPath, self.dirValue)
            self.view.addActions(self.onAction)
            self.view.initGUI()
    
    def dirValue(self):
        pass
    
    def onAction(self, initBool):
        # probably not necessary; figure out alternative method of handling gui events
        if initBool:
            self.onInit()
        else:
            self.onQuit()
    
    def onInit(self):
        pass
    
    def onQuit(self, newDirs=None):
        # newDirs is just to remind me what goes here;
        # figure out onPick execution path
        self.config.saveDirs(newDirs)
    

if __name__ == '__main__':
    app = PypubApp()
    