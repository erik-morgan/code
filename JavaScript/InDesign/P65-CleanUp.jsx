#target indesign
var root = Folder('/Users/HD6904/Erik/PM2INDD/');
var pmFiles = [];
var idFiles = [];
getChildren(root);

function getChildren(parent){
	var children = parent.getFiles();
	for (var i = 0; i < children.length; i++){
		if (children[i] instanceof Folder){
			getChildren(children[i]);
		}
		else if (children[i].name.substr(-3) == 'p65'){
			pmFiles.push(children[i]);
		}
		else if (children[i].name.substr(-4) == 'indd'){
			idFiles.push(children[i]);
		}
	}
}

for (var i = pmFiles.length - 1; i > -1; i--){
	var pmName = pmFiles[i].name;
	for (var j = 0; j < idFiles.length; j++){
		var idName = idFiles[j].name;
		if (pmName.replace(/\.p65/, '.indd') == idName){
			app.doScript('do shell script "mv \'' + pmFiles[i].toString().replace(/^~/, '/Users/HD6904') + '\' \'/Users/HD6904/Erik/PM2INDD/P65_FIN\'"', ScriptLanguage.APPLESCRIPT_LANGUAGE);
		}
	}
}
