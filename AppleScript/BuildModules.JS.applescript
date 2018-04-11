var app = Application.currentApplication(),
	se = Application('System Events'),
	bash = (cmd => app.doShellScript(cmd)),
	drawDirs = [
		se.folders.byName('/Users/HD6904/Desktop/Drawings'),
		se.folders.byName('/Users/HD6904/Desktop/NetworkFS/Libraries/Drawings')
	],
	procList = se.folders.byName('/Users/HD6904/Desktop/PDFs').files;
app.includeStandardAdditions = true;

function openDocuments (droppedItems) {
	for (var itemAlias of droppedItems) {
		if (item.class() == 'folder') return;
		var item = se.diskItems.byName(itemAlias.toString()),
			itemName = item.name();
		if (/^[A-Z]{2,6}[0-9]{4}.+TOC.+pdf$/i.test(itemName)) {
			var procID = /^[-A-Z0-9]+/i.exec(tocName)[0];
			processTOC(item, procID);
		}
	}
}

function processTOC (toc, tocNum) {
	var proj = toc.container().container(),
		idrx = RegExp('^' + tocNum + '[ .]'),
		fileList = [toc],
		procMatches = procList.filter(rp => idrx.test(rp.name())),
		drawText = bash('/usr/local/bin/pdftotext -layout -nopgbrk ' + quote(toc) + ' -'),
		drawMatches = drawText.match(/^ +([-0-9]{8,}|(\d-)?([A-Z]{2}[- ]?)\d{5})\S*/mg),
		drawNums = drawMatches.map(draw => draw.replace(/\s/g, ''));
	if (!procMatches.length) {
		// raise an alert about missing procedure
		return;
	}
	fileList.push(procMatches[0]);
	for (var i = 0; i < drawNums.length; i++) {
		var drawID = drawNums[i],
			drawFile = findFiles(drawsDirs, drawID);
		if (!drawFile) {
			// raise an alert about missing drawing
			return;
		}
		fileList.push(drawFile);
	}
	var filePaths = fileList.map(f => quote(f)),
		outDir = proj.folders.whose({name: {_beginsWith: 'PDF'}})[0],
		outPath = quote(outDir + '/' + tocNum + '.pdf');
	bash('/usr/local/bin/pdftk ' + filePaths.join(' ') + ' cat output ' + outPath);
}

function quote (item) {
	// Path(decodeURI()).toString()
	if (/diskItem|file|folder/.test(item.class())) item = item.posixPath();
	return '\'' + item.replace(/'/g, '\'\\\'\'');
}

function listDir (dirs, fname) {
	while (dirs.length) {
		var dir = dirs.shift();
		for (f of dir.files) {
			if (f.name().startswith(fname)) return f;
		}
		dirs.concat(dir.folders);
	}
	return null;
}

function findFiles (dirs, fname) {
	var subDirs = [];
	for (var d = 0; d < dirs.length; d++) {
		var dir = dirs[d];
		var files = dir.files.whose({name: {_beginsWith: fname}});
		if (files.length) return files[0];
		subDirs.concat(dir.folders);
	}
	return findFiles(subDirs, fname) || undefined;
}

/*
	pdftotext -simple -nodiag -nopgbrk SS4184*pdf - | grep -E '^ +.+\d{5,6}'
	
	rxMatch = s.match(/^ *([-0-9]{8,}|(\d-)?([A-Z]{2}[- ]?)\d{5})\S{0,}/mg)
	
	2-400000
	2-400000-00
	2-400000-000
	400000-00
	SD 30052
	TP37002
	2-PD-12345
	2-PD-12345-67
	2-PD-12345-67CP
*/
