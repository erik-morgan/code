var app = Application.currentApplication(), se = Application('System Events'), word = Application('Microsoft Word');
app.includeStandardAdditions = true;
var files = se.folders['/Users/HD6904/Erik/Procedure Status/Outlines/'].files.whose({_not:[{name:{_beginsWith:'.'}}]})();

for (var i = 0; i < files.length; i++){
    word.open(files[i]);
    var doc = word.activeDocument;
    var newDoc = '/Users/HD6904/Erik/Procedure Status/Outlines_TXT/' + doc.name().replace(/\.docx?/i, '.txt');
    doc.saveAs({fileName: newDoc, fileFormat:'format Unicode text'});
    doc.close({saving:'no'});
}
