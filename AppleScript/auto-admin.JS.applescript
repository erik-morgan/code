var app = Application.currentApplication(),
	se = Application('System Events'),
	mail = Application('Microsoft Outlook'),
	smdir = se.folders.byName('/Users/HD6904/Public/Erik\'s Dropbox/~ Recent Manuals/'),
	masterlib = se.folders.byName('/Users/HD6904/Desktop/Master Library/'),
	sendto = '/Volumes/share/SERVICE/DXF Files/Laura';
app.includeStandardAdditions = true;

addingFolderItemsTo(se.aliases.byName('/Users/HD6904/Documents/Project Folder Storage/'), ['/Users/HD6904/Documents/Project Folder Storage/4564 Woodside (Aung Siddhi-1, Dhana Hlaing-1, and Shwe Yee Htun-2)']);

function addingFolderItemsTo (thisFolderAlias, addedItems) {
	for (var itemAlias of addedItems) {
		var item = se.diskItems.byName(itemAlias.toString()),
			itemName = item.name();
		if (item.class() == 'folder') {
//			if (se.diskItems.byName(libdir + itemName).exists) {}
			packAndSend(item.posixPath());
			notify(itemName);
		}
		else continue;
	}
}

function packAndSend (dirPath) {
	var proj = se.folders.byName(dirPath),
		dirname = proj.name(),
		projDirs = proj.folders,
		copyList = [],
		projlib = se.make({new: masterlib.class(), at: masterlib, withProperties: {name: dirname}});
	for (var dir in projDirs) {
		if (/^(Order|Outline)/.test(projDirs.name())) copyList.push(dir);
	}
	var smID = /^\\d{4}( V\\d| R\\d)?( V\\d| R\\d)?/.exec(dirname)[0];
	copyList.push(smdir.files.whose({name: {_beginsWith: smID}})[0]);
	for (var cpitem of copyList) {
		app.doShellScript('cp -a ' + quoted(cpitem) + ' ' + quoted(projlib));
	}
	app.doShellScript('cp -a ' + quoted(projlib) + ' ' + quoted(sendto));
}

function notify (targetName) {
	var msgProps = '{subject:"New library folder ready", content:"Folder ' + targetName + ' is now in DXF Files/Laura."}',
		email = '{emailAddress:{name:"Laura Marin", address:"laura_marin@dril-quip.com"}}';
	osacmd = [
		'tell application "Microsoft Outlook"',
		'set msg to make new outgoing message with properties ' + msgProps,
		'make new recipient at msg with properties ' + email,
		'send msg',
		'end tell'
	];
	app.doShellScript('osascript -e \'' + osacmd.join('\n') + '\'');
}

function quoted (diskItem) {
	return "'" + diskItem.posixPath() + "'";
}