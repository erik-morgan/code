app = Application.currentApplication();
app.includeStandardAdditions = true;
se = Application('System Events');
var target = '/Users/HD6904/Downloads/Master Library';
var folderList = se.folders.byName('/Users/HD6904/Desktop/Digital SM Bank/').folders;
for (var i = 0; i < folderList.length; i++){
	var oldFold = folderList[i];
	var foldName = folderList[i].name();
	console.log(foldName);
	var newFold = se.Folder({name:target + '/' + foldName}).make();
	var childList = oldFold.diskItems;
	for (var j = 0; j < childList.length; j++){
		if (childList[j].name() !== '.DS_Store'){
			var child = childList[j];
			if (child.class() == 'folder'){
				app.doShellScript('cp -a "' + child.posixPath() + '" "' + newFold.posixPath() + '"');
			}
			else if (/\(OCR-SIE\)/.test(child.name())){
				var newPath = newFold.posixPath() + '/' + child.name().replace(/ \(OCR-SIE\)/, '');
				app.doShellScript('cp -a "' + child.posixPath() + '" "' + newPath + '"');
			}
			else if (!se.diskItems.byName(child.posixPath().replace(/\.pdf/i, ' (OCR-SIE).pdf')).exists){
				app.doShellScript('cp -a "' + child.posixPath() + '" "' + newFold.posixPath() + '"');
			}
		}
	}
}