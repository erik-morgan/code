class OutlineError(Exception):
    def __init__(self):
        self.message = 'No outline found in project directory. Outlines must end in "Outline.docx".'

class AppendixError(Exception):
    def __init__(self):
        paragraphs = [
            'No appendix file was found in project directory\n',
            ('To avoid the nightmare of third-party documents, this '
                'application requires a pre-packaged appendix.\n'),
            'The appendix must:',
            '  1. Be named "Appendix.pdf"',
            '  2. Be located within the project folder',
            '  3. Have all necessary bookmarks'
        ]
        self.message = '\n'.join(paragraphs)

class MissingFileError(Exception):
    def __init__(self, missing_files):
        self.message = 'Unable to find the following files:\n' + '\n'.join(missing_files)

class ConfigDirError(Exception):
    def __init__(self):
        self.message = ('pubdirs in Configuration class are invalid.\n'
                        'pubdirs must be a list with label names, and must have a Project item.')
#        self.message = ('pubdirs in Configuration class are invalid.\n'
#                        'pubdirs must be a dictionary with var_name_no_spaces: label_name pairs, and must have a proj:Projects item.')
