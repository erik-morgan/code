# 2018-09-02 00:32:03 #
from os import walk, remove
from os.path import join, split, basename
import re
import requests as req
from lxml.html import fromstring, get_element_by_id
from io import BytesIO
from PyPDF2 import PdfFileReader as Reader, PdfFileWriter as Writer, PdfFileMerger as Merger

class Part:
    def __init__(self, num, rev):
        self.num = num
        self.rev = rev
    
    def get_rev(self):
        with req.get('http://houston/ErpWeb/PartDetails.aspx',
                     params={'PartNumber': self.num}) as reply:
            node = fromstring(reply.content).get_element_by_id('revisionNum')
        self.real_rev = node.text_content()
        self.updated = self.rev == self.real_rev

class Drawing(Part):
    def get_pages(self, file):
        

class SpecSheet(Part):
    def get_pages(self):
        head = {'Cookie': f'DqUserInfo=PartDocumentReader=AMERICAS\\{USER}'}
        with req.get('http://houston/ErpWeb/Part/PartDocumentReader.aspx',
                     params={'PartNumber': self.num, 'checkInProcess': 0},
                     headers=head) as reply:
            return reply.content
        

class PartFile:
    def __init__(self, file):
        self.file = file
        self.path, self.name = split(file)
        part, drev, srev = self.name.split('.')[0:-1]
        if '.-.' not in self.name:
            self.draw = Drawing(part.rsplit('-', 1)[0], drev)
            self.spec = SpecSheet(part, srev)
        elif srev == '-':
            self.draw = Drawing(part, drev)
        else:
            self.spec = SpecSheet(part, srev)
    
    def update(self, drawings):
        # basically, the update methods should only differ in what they do
        # with the data, not how they get it. i guess that is why i should
        # implement the data retrieval in the drawing/specsheet classes
    
    def read_pdf(self, pages=-1):
        # read pages from pdf

class DrawFile:
    pass

class SpecFile:
    pass

# the idea is to be able to update the files from here,
# only by interacting with class objects
# 
