var checkBackup, tfBackup, check0, check1, check2, check3, check4, check5, check6, check7, check8, check9;
var date = new Date();
var dateString = ('0' + (date.getMonth() + 1).toString()).substr(-2) + ('0' + (date.getDate().toString())).substr(-2) + date.getFullYear().toString(); 
var timeString = ('0' + date.getHours().toString()).substr(-2) + ('0' + date.getMinutes().toString()).substr(-2) + ('0' + date.getSeconds().toString()).substr(-2);
var defaultLocation = Folder.decode(Folder(File($.fileName).parent));
var docName = File.decode($.fileName).replace(RegExp(defaultLocation + '/|\\.jsx', 'ig'), '');
var descs = ['• Removes all guides from the document\r• Inserts correct guides only on the master spread', '• Removes all graphics from the master spread\r• Locates \'DQ Logo\' and places it at the correct locations/scale', '• Locates master spread footers and saves their contents\r• Recreates the footers with the correct sizing and alignment\r• Does not alter the footer\'s contents', '• Straightens any crooked text frame in the document\r• Properly positions the main story\'s text frames\r• Includes locked items', '• Attempts to assign the correct values to each color swatch\r• Any missing swatches will be added\r• Any extra swatches will be removed', '• Removes any rectangle whose fill color is \'Black\'\r• Affects locked items\r• Excludes items on the master spread', '• Any missing paragraph styles will be added\r• Any extra paragraph styles will be removed\r• Sets the paragraph style properties to their correct values', '• Corrects each note\'s formatting/color and adds a gray note box underneath\r• Affects locked items\r• Runs ClearBoxes and ResetColors by default', '• Removes redundant whitespace, formats \'Figure\' references, and corrects\rgroup text wrap\r• Affects locked items and excludes items on the master spread', '• Increments the footer\'s revision number and ammends the date\r• Saves the document in the same location and updates filename\'s revision'];
var names = ['FixGuides', 'FixLogos', 'AlignFooters', 'FixFrames', 'ResetColors', 'ClearBoxes', 'ResetStyles', 'NoteBoxes', 'CleanDoc', 'AddRev'];
var checkString = 'checkbox {preferredSize:[18, 18], alignment:["left", "center"]}';

var w = new Window('dialog', 'Writer\'s Toolbox', undefined);
	w.margins = w.spacing = 0;
	var fillHeader = w.graphics.newBrush(w.graphics.BrushType.SOLID_COLOR, [(56/255), (56/255), (56/255)]);
	var penHeader = w.graphics.newPen(w.graphics.PenType.SOLID_COLOR, [(56/255), (56/255), (56/255)], 1);
	var penWhite = w.graphics.newPen(w.graphics.PenType.SOLID_COLOR, [(255/255), (255/255), (255/255)], 1);
	var gHeaders = w.add('group');
		gHeaders.alignment = 'fill';
		gHeaders.alignChildren = ['left', 'center'];
		gHeaders.margins = [6, 6, 0, 6];
		gHeaders.spacing = 15;
		gHeaders.preferredSize = [640, 48];
		gHeaders.graphics.backgroundColor = fillHeader;
		var checkAll = gHeaders.add(checkString);
			checkAll.onClick = function (){
				check();
			};
		var headerName = gHeaders.add('staticText', undefined, "Name");
			headerName.characters = 20;
			headerName.graphics.foregroundColor = penWhite;
		var headerDesc = gHeaders.add('staticText', undefined, 'Description');
			headerDesc.characters = 60;
			headerDesc.graphics.foregroundColor = penWhite;
	for (i = 0; i < names.length; i++){
		if (i > 0){
			var rule = w.add('panel', undefined, undefined, {borderStyle:'black'});
				rule.alignment = 'fill';
				rule.preferredSize = [-1, 1];
				rule.margins = rule.spacing = 0;
		}
		row = w.add('group');
			row.alignment = ['fill', 'fill'];
			row.alignChildren = ['left', 'center'];
			row.margins = [6, 6, 0, 6];
			row.spacing = 15;
		switch (i) {
			case 0: check0 = row.add(checkString), check0.onClick = function (){check(i);}; break;
			case 1: check1 = row.add(checkString), check1.onClick = function (){check(i);}; break;
			case 2: check2 = row.add(checkString), check2.onClick = function (){check(i);}; break;
			case 3: check3 = row.add(checkString), check3.onClick = function (){check(i);}; break;
			case 4: check4 = row.add(checkString), check4.onClick = function (){check(i);}; break;
			case 5: check5 = row.add(checkString), check5.onClick = function (){check(i);}; break;
			case 6: check6 = row.add(checkString), check6.onClick = function (){check(i);}; break;
			case 7: check7 = row.add(checkString), check7.onClick = function (){check(i);}; break;
			case 8: check8 = row.add(checkString), check8.onClick = function (){check(i);}; break;
			case 9: check9 = row.add(checkString), check9.onClick = function (){check(i);}; break;
		}
		row.name = row.add('staticText', undefined, names[i]);
			row.name.characters = 20;
			row.name.graphics.foregroundColor = penHeader;
		row.gDesc = row.add('group');
			row.gDesc.preferredSize = [-1, 48];
			row.gDesc.alignChildren = ['left', 'center'];
			row.gDesc.margins = row.gDesc.spacing = 0;
			row.gDesc.desc = row.gDesc.add('staticText', undefined, descs[i], {multiline:true});
				row.gDesc.desc.characters = 60;
				row.gDesc.desc.graphics.foregroundColor = penHeader;
	}
	var gBottom = w.add('group');
		gBottom.preferredSize = [640, 60];
		gBottom.alignment = gBottom.alignChildren = ['fill', 'fill'];
		gBottom.margins = gBottom.spacing = 0;
		gBottom.graphics.backgroundColor = fillHeader;
		var gCheckBackup = gBottom.add('group');
			gCheckBackup.alignChildren = ['left', 'center'];
			gCheckBackup.margins = [6, 0, 0, 0];
			gCheckBackup.spacing = 6;
			checkBackup = gCheckBackup.add('checkbox', undefined, undefined);
				checkBackup.preferredSize = [18, 18];
				checkBackup.onClick = function (){
					tfBackup = checkBackup.value;
					(checkBackup.value) ? addBackupPanel() : removeBackupPanel();
				};
			var labelBackup = gCheckBackup.add('staticText', undefined, 'Backup the active document');
				labelBackup.graphics.foregroundColor = penWhite;
		var gButtons = gBottom.add('group');
			gButtons.alignChildren = ['right', 'fill'];
			gButtons.margins = [0, 6, 6, 6];
			gButtons.spacing = 0;
			var bRun = gButtons.add('button', undefined, 'Run');
				bRun.enabled = false;
				bRun.helpTip = 'Runs the selected functions';
				bRun.size = [150, -1];
			var bCancel = gButtons.add('button', undefined, 'Cancel', {name:'cancel'});
				bCancel.helpTip = 'Cancels the entire script';
				bCancel.size = [150, -1];
w.show();

function check(i){
	if (i == 7){
		check4.value = check5.value = check7.value;
	}
	if (i == undefined){
		check0.value = check1.value = check2.value = check3.value = check4.value = check5.value = check6.value = check7.value = check8.value = check9.value = checkAll.value;
	}
	bRun.enabled = canRun();
}

function canRun(){
	checkBoxes = [check0, check1, check2, check3, check4, check5, check6, check7, check8, check9];
	for (r = 0; r < checkBoxes.length; r++){
		if (checkBoxes[r].value){
			return true;
		}
	}
	return false;
}

function addBackupPanel(){
	var g = w.add('group');
		g.alignment = ['fill', 'fill'];
		g.alignChildren = ['fill', 'fill'];
		g.margins = 6;
		g.spacing = 0;
		g.graphics.backgroundColor = fillHeader;
		var p = g.add('panel', undefined, undefined, {borderStyle:'etched'});
			p.alignChildren = ['fill', 'fill'];
			var gFile = p.add('group');
				gFile.margins = gFile.spacing = 0;
				gFile.alignChildren = ['left', 'center'];
				var labelFile = gFile.add('staticText', undefined, 'Filename:');
					labelFile.characters = 10;
					labelFile.graphics.foregroundColor = penWhite;
				var editFile = gFile.add('editText', undefined, fileName(), {borderless:true});
					editFile.characters = 64;
			var gPath = p.add('group');
				gPath.margins = gPath.spacing = 0;
				gPath.alignChildren = ['left', 'center'];
				var labelPath = gPath.add('staticText', undefined, 'Location:');
					labelPath.characters = 10;
					labelPath.graphics.foregroundColor = penWhite;
				var editPath = gPath.add('editText', undefined, defaultLocation + '/Backups', {borderless:true});
					editPath.characters = 64;
				var bBrowse = gPath.add('button', undefined, 'Browse');
					bBrowse.alignment = ['fill', 'fill'];
					bBrowse.helpTip = 'Browse to the backup directory';
					bBrowse.onClick = function (){
						var pickFolder = Folder.selectDialog('Choose the backup location');
						backupFolder = Folder(pickFolder);
						editPath.text = Folder.decode(backupFolder);
					};
	w.layout.layout(true);
	function fileName(){
		if (docName.length == docName.replace(/ r\d+ /, '').length){
			return (docName.replace(/ .+/, '') + ' ' + dateString + ' ' + timeString + '.indd');
		}
		else {
			return (docName.replace(/( r\d+).+/, '$1') + ' ' + dateString + ' ' + timeString + '.indd');
		}
	}
}

function removeBackupPanel(){
	w.remove(w.children.length - 1);
	w.center();
	w.layout.layout(true);
}