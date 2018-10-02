# 2018-10-01 20:09:47 #
from PyPDF2 import PdfFileReader as Reader
import string
import re

class PDFParser:
    escapes = {'n': '\n', 'r': '\r', 't': '\t'}
    hexes = {}
    printable = set(string.printable)
    hexdigits = set(string.hexdigits)
    
    def get_text(self, pdf):
        self.pos = 0
        pages = Reader(pdf).pages
        text = '\n'.join(''.join(self.parse(page)) for page in pages)
        text = re.sub(r'\\(\d{1,3})', self.fromoct, text)
        text = re.sub(r'\s*\n\s*', '\n', text)
        text = re.sub(r'(?<=\S)-\s+', '', text)
        text = re.sub(r' {2,}', ' ', text)
        return text
    
    def parse(self, page):
        data = page.getContents().getData().decode()
        tokens = re.compile(r'\(|(?<!<)<(?!<)|([\d.]+)?\s(Td|TD|Tm|T\*\'|")\b')
        tm = '0'
        token = tokens.search(data)
        while token:
            tok = token[0]
            self.pos = token.end()
            if tok[0].isdigit():
                if token[2] == 'Tm' and token[1] != tm:
                    tm = token[1]
                    yield '\n'
                elif token[2] in 'TdTD' and token[1] != '0':
                    yield '\n'
            elif tok == '(':
                yield from self.parse_str(data)
            elif tok == '<':
                yield from self.parse_hex(data)
            else:
                yield '\n'
            token = tokens.search(data, self.pos)
    
    def parse_str(self, data):
        token_sum = 0
        while True:
            char = data[self.pos]
            if char in '()':
                if char == ')' and token_sum == 0:
                    break
                else:
                    token_sum += 1 if char == '(' else -1
            if char == '\\':
                self.pos += 1
                char = data[self.pos]
                if char in '\n\r' and data[self.pos + 1] in '\n\r':
                    self.pos += 1
                elif char.isdigit():
                    char = '\\' + char
                else:
                    char = self.escapes.get(char, char)
            self.pos += 1
            yield char
    
    def parse_hex(self, data):
        remainder = {0: '', 1: '0'}
        hchars = data[self.pos:data.find('>', self.pos)]
        self.pos += len(hchars)
        if hchars not in self.hexes and set(hchars) < self.hexdigits:
            hexstr = hchars + remainder[len(hchars) % 2]
            code = 'utf-16' if hexstr.startswith('FEFF') else 'utf-8'
            hexstr = bytes.fromhex(hexstr).decode(code)
            if set(hexstr) < self.printable:
                self.hexes[hchars] = hexstr
        yield self.hexes.get(hchars, '')
    
    @staticmethod
    def fromoct(match):
        c = chr(int(match[1], 8))
        return c if c in string.printable else ' '

if __name__ == '__main__':
    parser = PDFParser()
    results = parser.get_text('/home/erik/Downloads/build_modules/PDF Spec/SS0351-13 TOC.pdf')
    print(results)
