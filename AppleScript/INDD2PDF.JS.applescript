app = Application.currentApplication();
app.includeStandardAdditions = true;
se = Application('System Events');
logFile = Path('/Users/secho/Desktop/INDD2PDF_LOG.txt');

main();

function main(){
	app.openForAccess(logFile, {writePermission: true});
	var txt = "You will now be prompted for two folder selections. " + 
			  "Choose the input folder first, and the output folder second";
	app.displayDialog(txt, {
		buttons: ["Cancel", "I understand"],
		defaultButton: "I understand"
	});
	folderIn = app.chooseFolder({withPrompt:"Please select an input folder:"});
	folderOut = app.chooseFolder({withPrompt:"Please select an output folder:"});
	var fileList = gatherINDDs(folderIn.toString());
	prog(fileList.length);
	processINDDs(fileList, folderOut);
	app.closeAccess(logFile);
}

function gatherINDDs(parentPath){
	var parent = se.folders.byName(parentPath);
	var folders = parent.folders.posixPath();
	var files = parent.files.posixPath();
	for (var fold of folders) {
		files = files.concat(gatherINDDs(fold));
	}
	return files.filter(function (str) {
		return /.*\.indd$/i.test(str);
	});
}

function processINDDs(files, dest) {
	var indd = Application('Adobe InDesign 2021');
	var numDocs = indd.documents.length;
	indd.scriptPreferences.userInteractionLevel = 'never interact';
	indd.preflightOptions.preflightOff = true;
	indd.scriptPreferences.enableRedraw = false;
	for (var file of files) {
		prog();
		var fileName = se.files.byName(file).name();
		var outFile = Path(dest.toString() + '/' + fileName.replace(/indd$/i, 'pdf'));
		if (!fileExists(outFile)) {
			indd.open(file);
			var doc = indd.activeDocument;
			var links = doc.links;
			if (arrayComp(Array(links.length).fill('normal'), links.status())) {
				doc.export({format: 'Adobe PDF (Print)', to: outFile, showingOptions: false, usingPdfExportPreset: 'PQMOD'}, {timeout: 300});
				logit('Document ' + fileName + ' exported successfully');
			} else {
				logit('Document ' + fileName + ' failed because of broken links');
			}
			doc.close({saving: 'no'});
			while (indd.documents.length > numDocs) {
				app.delay(5);
			}
		}
	}
	indd.scriptPreferences.userInteractionLevel = 'interact with alerts';
	indd.preflightOptions.preflightOff = false;
	indd.scriptPreferences.enableRedraw = true;
}

function prog(incr) {
	if (incr) {
		Progress.totalUnitCount = incr;
		Progress.completedUnitCount = 0;
		Progress.description = 'Processing INDD files...';
		Progress.additionalDescription = 'Preparing to process...';
	} else {
		Progress.completedUnitCount++;
		Progress.additionalDescription = 'Processing INDD file ' + Progress.completedUnitCount + ' of ' + Progress.totalUnitCount;
	}
}

function logit(log_msg) {
	var timeStamp = new Date().toTimeString().slice(0, 8);
	app.write('\r\n' + timeStamp + ' | ' + log_msg, {to: logFile, startingAt: -1});
}

function arrayComp(arr1, arr2) {
	if (arr1.length !== arr2.length)
		return false;
	for (var a = 0; a < arr1.length; a++) {
		if (arr1[a] !== arr2[a])
			return false;
	}
	return true;
}

function fileExists(path) {
	return app.doShellScript('test -f "' + path + '" && echo TRUE || echo FALSE') === 'TRUE';
}
