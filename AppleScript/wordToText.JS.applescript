var app = Application.currentApplication(), se = Application('System Events'), word = Application('Microsoft Word');
app.includeStandardAdditions = true;
var files = se.folders['/Users/HD6904/Erik/Procedure Status/outlines/'].files();
for (var i = 0; i < files.length; i++){
	word.open(files[i].toString());
	var doc = word.activeDocument,
		docNew = doc.name().replace(/(.+\/)outlines(\/.+)\.docx?/i, '$1outlines-txt-as$2.txt');
	console.log('File ' + i + '/' + files.length + ' = ' + name);
	doc.saveAs({fileName: docNew, fileFormat:'format Unicode text'});
	doc.close({saving:'no'});
}
