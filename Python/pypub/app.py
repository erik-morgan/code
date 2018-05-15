from gui import PypubGUI
from config import AppConfig
from exceptions import ConfigError
# from send2trash import send2trash

# add clean_up function for aborted process
# add help dialog

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
                self.view.addRow(dirName, dirPath)
            self.view.startGUI(self.onAction)
    
    def onAction(self, actionFlag):
        dirs = self.view.dirs
        if actionFlag:
            print(f'Execution complete...Results:\n{dirs}')
        else:
            self.config.saveDirs(dirs)
    

if __name__ == '__main__':
    app = PypubApp()
    
