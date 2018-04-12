var app = Application.currentApplication(),
	se = Application('System Events'),
	bash = (cmd => app.doShellScript(cmd)),
	drawDirs = [
		se.folders.byName('/Users/HD6904/Desktop/Drawings'),
		se.folders.byName('/Users/HD6904/Desktop/NetworkFS/Libraries/Drawings')
	],
	procDir = se.folders.byName('/Users/HD6904/Desktop/PDFs');

app.includeStandardAdditions = true;

function openDocuments (droppedItems) {
	for (var itemAlias of droppedItems) {
		var item = se.diskItems.byName(itemAlias.toString()),
			itemName = item.name();
		if (item.class() == 'folder') continue;
		if (/^[A-Z]{2,6}[0-9]{4}.+TOC.+pdf$/i.test(itemName)) {
			var procID = /^[-A-Z0-9]+/i.exec(itemName)[0];
			processTOC(item, procID);
		}
	}
}

function processTOC (toc, tocNum) {
	var proj = toc.container().container(),
		rx = '.+/' + tocNum + '[ .].*pdf',
		fileList = [toc];
		procList = bash('find -E ' + quote(procDir) + ' -regex  ' + quote(rx)).split(/\r|\n/);
	if (!procList.length) {
		app.displayDialog('Could not find procedure ' + tocNum + ' in ' + procDir.posixPath());
		return;
	}
	fileList.push(procList[0]);
	var drawText = bash('/usr/local/bin/pdftotext -layout -nopgbrk ' + quote(toc) + ' -'),
		drawMatches = drawText.match(/^ +([-0-9]{8,}|(\d-)?([A-Z]{2}[- ]?)\d{5})\S*/mg),
		drawNums = drawMatches.map(draw => draw.replace(/\s/g, '')),
		missingDraws = [];
	for (var n = 0; n < drawNums.length; n++) {
		var drawID = drawNums[n],
			drawFile = findFiles(drawDirs, drawID);
		if (drawFile) fileList.push(drawFile);
		else missingDraws.push(drawID);
	}
	if (missingDraws.length) {
		app.displayDialog('Could not find drawing(s): ' + missingDraws.join(', '));
		return;
	}
	// ADD ABILITY TO CHECK FOR BASE NUMBER ONLY (EG WHEN TOC SAYS -14)
	var filePaths = fileList.map(f => quote(f)),
		outDir = proj.folders.whose({name: {_beginsWith: 'PDF'}})[0],
		outPath = quote(outDir.posixPath() + '/' + tocNum + '.pdf');
	bash('/usr/local/bin/pdftk ' + filePaths.join(' ') + ' cat output ' + outPath);
}

function quote (item) {
	if (item instanceof String) s = item;
	else if (item.hasOwnProperty('posixPath')) s = item.posixPath();
	else s = item.toString();
	return '\'' + s.replace(/'/g, '\'\\\'\'') + '\'';
}

function findFiles (dirs, fname) {
	var findcmd = 'find ' + dirs.map(d => quote(d)).join(' ') + ' -iname \'' + fname + '*pdf\'',
		found = bash(findcmd).split(/\r|\n/);
	if (found.length) return found[0];
	return undefined;
}
