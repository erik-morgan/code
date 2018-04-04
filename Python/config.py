from pathlib import Path
import re

# except OSError as e:
#     print(f'Failed to open file: OSError\nError Number: {e.errno}\n'
#           f'Error Message: {e.strerror}\nError File: {e.filename}')

class Config:
    def __init__(self, config_path):
        if isinstance(config_path, str):
            self.config_file = Path(config_path)
        elif isinstance(config_path, Path):
            self.config_file = config_path
        else:
            raise TypeError('Config accepts a string or Path object')
        if not self.config_file.parent.exists():
            raise OSError(f'Parent of {self.config_file} does not exist')
    
    def load(self, delim=None):
        if self.config_file.exists():
            self._contents = self.config_file.read_text()
        else:
            raise OSError(f'{self.config_file} does not exist')
        self._delim = delim if delim else get_delim()
        line_list = [line for line in clean_lines()]
        return dict(line_list) if self._delim else line_list
    
    def dump(self, config_data, delim='='):
        if isinstance(config_data, dict):
            config_data = [delim.join(i) for i in config_data]
        elif not isinstance(config_data, list):
            raise TypeError('Config.dump accepts a list or dict')
        self.config_file.write_text('\n'.join(config_data))
    
    def get_delim():
        num_lines = self._contents.count('\n')
        if self._contents.count('=') == num_lines:
            return '='
        if self._contents.count(':') == num_lines:
            return ':'
        else:
            return ''
    
    def clean_lines():
        lines = self._contents.splitlines()
        for line in lines:
            line = line.strip()
            i = line.find(self._delim)
            yield (line[:i], line[i++:]) if i else line
    