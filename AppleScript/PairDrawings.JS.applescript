var app = Application.currentApplication(),
	se = SystemEvents = Application('System Events'),
	parentDir;
app.includeStandardAdditions = true;

function openDocuments (droppedItems){
	var items = {};
	for (var item of droppedItems){
		var diskItem = se.diskItems.byName(item.toString()),
			itemName = diskItem.name();
		if (/\d{5}.*pdf$/.test(itemName)) {
			var prefix = /^(\d-)?\d{6}/.exec(itemName)[0];
			if (items.hasOwnProperty(prefix)) items[prefix].push(diskItem);
			else items[prefix] = [diskItem];
		}
	}
	parentDir = diskItem.container().posixPath();
	processItems(items);
}

function processItems (items) {
	for (key in items) {
		var parts = items[key];
		if (parts.length < 2) continue;
		parts.sort(function (f1, f2) {
			var a = f1.name().split('.'),
				b = f2.name().split('.');
			if (a.length < 3) return f1.name() < f2.name() ? -1 : 1;
			if (a[0] !== b[0]) return a[0] == key ? -1 : 1;
			if (/^[A-Z]+$/i.test(a[1])) return -1;
			if (/^[A-Z]+$/i.test(b[1])) return 1;
			return a[1] - b[1];
		});
		app.doShellScript(pdftkString(parts));
	}
}

function pdftkString (flist) {
	var drawRev = flist[0].name().split('.')[1],
		lastFile = flist[flist.length - 1].posixPath(),
		outPath = '"' + lastFile.replace(/([A-Z]+\.pdf)$/i, drawRev + '.$1"'),
		cmd = '/usr/local/bin/pdftk ',
		inPaths = flist.map(di => '"' + di.posixPath() + '"').join(' ');
	return cmd + inPaths + ' cat output ' + outPath;
}

