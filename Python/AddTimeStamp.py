import sublime
import sublime_plugin
from datetime import datetime as dt

class AddTimeStampCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        stamp = dt.now().strftime('%Y-%m-%d %H:%M:%S')
        new_stamp = '// ' + stamp + ' //'
        old_stamp = self.view.find(r'\A// [-0-9]{10} [:0-9]{8} //', 0)
        if old_stamp:
            self.view.replace(edit, old_stamp, new_stamp)
        else:
            self.view.insert(edit, 0, new_stamp + '\n')

class AddTimeStamp(sublime_plugin.EventListener):
    def on_pre_save(self, view):
        name = view.file_name()
        if name and name.lower().endswith('jsx'):
            view.run_command('add_time_stamp')

# make it only affect files with certain syntax based on prefs
# add comment to beginning of file with the current datetime
# stamp_parts = ['', '', '']
# comment_beg = ''
# comment_end = ''
# for var in self.view.meta_info('shellVariables', 0):
#     if var['name'] == 'TM_COMMENT_START':
#         comment_beg = var['value'].strip()
#     if var['name'] == 'TM_COMMENT_END':
#         comment_end = var['value'].strip()
