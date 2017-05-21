var folderIcon  =  "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x18\x00\x00\x00\x18\b\x06\x00\x00\x00\u00E0w=\u00F8\x00\x00\x00\x04sBIT\b\b\b\b|\bd\u0088\x00\x00\x00\tpHYs\x00\x00\x05\u00BA\x00\x00\x05\u00BA\x01\x1B\u00ED\u008D\u00C9\x00\x00\x00\x19tEXtSoftware\x00www.inkscape.org\u009B\u00EE<\x1A\x00\x00\x01cIDATH\u0089\u00D5\u0096M/\x03Q\x14\u0086\u00DFsf\u00CCT'e\x16m\u0087\u00B2!\u00B1\u00B0iX\u0090X\u0093n\u00AC\u00FD\x07\x7F\u00C0\u00DF\u00B10\"\u00D2\u0088X\x10Ic\u00C1\u0096\u0094\u00A46\u00BA\u0091Z\x10\u0094D\u0094\u00F8\u00E8\u00C7\u00B1\x10\u009Di\x10cz+qVwNn\u009E\u00E7\u00DEs\u00BF\u0086D\x04\u009D\f\u00EE(\x1D\u0080~\u0093s\x16\u00880\u00FD]\u0087\u0086H6\u0091\u00B9^\f+\u00A0r.\u00F9S\u008D^\u00EAD\x13\u00CE\u00CC\u00E5q\x18A\u0090\x12\u0099,\u00B2R\u00DA\x1D\u008A\u0084\x11\x04\u0099\u00C1G\u009C\x02\u00A8\x04@V!\u00F5\u00F9x\u00A6\u009C\x07\x00\u00FD\x17\u0083\x19\x0E\u00D6M \u00A4\u00CD\x01\u00C8\x03\x7F\u00B1\u008B\u00BE\u00C8U\x01\u00BAk\x07\u00CA\u009A&\u00E5\u0083\u00D9\u00BE\u0086Y\u00AB|Z\x03\u00ADg\u00A4@Fo\u00BA\x1D\u0081/\u00CE[KD|\u00A2\x10\x0E\x02\n-\x022\u00E3W\u00AA\u00E0\x00\u00D0\x00\\\u00BF\u00A0\u00AE[\u00FD\u00A3\n\u00F9\u00F7\u008F\u00CF\u00D6FS@l\x1C\nu%\u00D5\u00F1imp*\u00FB\u00E4\t\"\u00CE\u00AB:8\x00\"\x17\u00F0\u00CE\u00C1\x03G\x13\u00E3\n\u00F1g\u00F6\u00D8\u00E6\u009E'\u00D0\u00A2G\x00GU\u00D1\u0089d\x19x\x7Fh\x18\x004+\u00A5\f\x0E\x00\u00CC\u00E26\u00DB\x00.\u00C8\u00B0U\u0096g?\u0096\u00DE.6\x05d\u00D8E(\u00BC\u0093D\u00B0\u00E4\u00FFf\u00B6\x06R\u00AA\u00E0\x00\u00AAz\u00CD\\\u00F5't\u00D2\u00BBwD\u00A4\u00A4\u0082N\u00E0\u00AD\u00D8\u00E4\u00FAmK\u00EE\u00DF\u00FFU\u00BC\x01\u00FC\u00D6_`\u00D2\u00DFRi\x00\x00\x00\x00IEND\u00AEB`\u0082";
var checks = ['check0', 'check1', 'check2', 'check3', 'check4', 'check5', 'check6', 'check7', 'check8', 'check9'];
var funcNames = ['FixGuides', 'FixLogos', 'AlignFooters', 'FixFrames', 'ResetColors', 'ClearBoxes', 'ResetStyles', 'NoteBoxes', 'CleanDoc', 'AddRev'];
var funcDescs = ['Clears all guides and inserts correct ones on master spread', 'Clears all master spread graphics and places logos at correct location/scale', 'Optimizes master page footers\' size/alignment', 'Straightens crooked text frames and corrects main story frame positions', 'Sets swatch values, removes any extras, and creates missing ones', 'Clears gray note boxes from entire document', 'Sets paragraph styles\' properties, removes any extras, and creates missing ones', 'Finds all notes, checks their formatting/color, and creates a box behind each one.', 'Removes multiple/trailing returns/whitespaces, corrects curly quotes, capitalizes/bolds figures, and fixes group text wrap.', 'Increments the rev/date in the footers and saves the doc in the same location with an incremented rev in the filename.'];

var i, check0, check1, check2, check3, check4, check5, check6, check7, check8, check9;

var w= new Window('dialog', 'Writer\'s Toolbox', undefined);
	var brushBlack = w.graphics.newBrush(w.graphics.BrushType.SOLID_COLOR, [0, 0, 0]);
	var brushWhite = w.graphics.newBrush(w.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
	var brushHeader = w.graphics.newBrush(w.graphics.BrushType.SOLID_COLOR, [0.533, 0.533,  0.533]);
	var penWhite = w.graphics.newPen(w.graphics.PenType.SOLID_COLOR, [1, 1, 1], 1);
	w.spacing = 0;
	var gHeaders = w.add('group {spacing:1, margins:1, preferredSize:[-1, 30]}');
		gHeaders.graphics.backgroundColor = brushBlack;
		var gCheck = gHeaders.add('group {alignment:["left", "fill"], margins:[8, 1, 3, 0]}');
			gCheck.graphics.backgroundColor = brushHeader;
			var hCheck = gCheck.add('checkbox {helpTip:"Select all functions", preferredSize:[18, 18], alignment:["right", "center"]}');
				hCheck.onClick = function() {check();};
		var gName = gHeaders.add('group {alignment:["fill", "fill"], margins:[9, 0, 0, 0]}');
			gName.graphics.backgroundColor = brushHeader;
			var hName = gName.add('staticText {alignment:["left", "center"], text:"Function Name", characters:20}');
				hName.graphics.foregroundColor = penWhite;
		var gDesc = gHeaders.add('group {alignment:["fill", "fill"], margins:[9, 0, 0, 0]}');
			gDesc.graphics.backgroundColor = brushHeader;
			var hDesc = gDesc.add('staticText {alignment:["center", "center"], text:"Descriptions", characters:100}');
				hDesc.graphics.foregroundColor = penWhite;
	var row0 = w.add('group {spacing:1, margins:[1, 0, 1, 1], preferredSize:[-1, 30]}');
		row0.graphics.backgroundColor = brushBlack;
		with (row0) {
			gCheck0 = row0.add('group {alignment:["left", "fill"], margins:[8, 1, 3, 0]}');
				gCheck0.graphics.backgroundColor = brushWhite;
				with (gCheck0)
				
				
	var row0 = w.add('group {spacing:1, margins:[1, 0, 1, 1], preferredSize:[-1, 30]}');
		row0.graphics.backgroundColor = brushBlack;
		with (row0.add('group {alignment:["left", "fill"], margins:[8, 1, 3, 0]}')){
			graphics.backgroundColor = brushWhite;
			var check0 = 
	
function buildRow(i){
	with (w.add('group {spacing:1, margins:[1, 0, 1, 1], preferredSize:[-1, 30], graphics["backgroundColor"]:brushBlack}')){
		with (add('group {alignment:["left", "fill"], margins:[8, 1, 3, 0], graphics["backgroundColor"]:brushWhite}')){
			eval("check" + i + '=' + 'add(\'checkbox {preferredSize:[18, 18], alignment:["right", "center"]}\')');
			
	
	
	
	
	
	for (i = 0; i < rows.length; i++){
		var gRow, gCheckbox, checkBox, gFuncName, name, gFuncDesc, desc;
		gRow = w.add('group {spacing:1, margins:[1, 0, 1, 1], preferredSize:[-1, 30]}');
			gRow.graphics.backgroundColor = brushBlack;
			gCheckbox = gRow.add('group {alignment:["left", "fill"], margins:[8, 1, 3, 0]}');
				gCheckbox.graphics.backgroundColor = brushWhite;
				eval(checks[i] + ' = ' + 'gCheckbox.add(\'checkbox {preferredSize:[18, 18], alignment:["right", "center"]}\')');
				eval(checks[i]).onClick = function() {check(i);};
			gFuncName = gRow.add('group {alignment:["fill", "fill"], margins:[9, 0, 0, 0]}');
				gFuncName.graphics.backgroundColor = brushWhite;
				name = gFuncName.add('staticText', undefined, funcNames[i]);
					name.alignment = ['left', 'center'];
					name.characters = 20;
			gFuncDesc = gRow.add('group {alignment:["fill", "fill"], margins:[9, 0, 0, 0]}');
				gFuncDesc.graphics.backgroundColor = brushWhite;
				desc = gFuncDesc.add('staticText', undefined, funcDescs[i]);
					desc.alignment = ['center', 'center'];
					desc.characters = 100;
	}
	var gSpacing = w.add('group {alignment:["fill", "fill"], preferredSize:[-1, 15]}');
	var gExecute = w.add('group {alignment:["fill", "fill"], margins:0, spacing:15}');
		var gBackup = gExecute.add('group {alignment:["fill", "fill"], alignChildren:["left", "center"], spacing:10, margins:10, orientation:"column"}');
			gBackup.graphics.backgroundColor = brushHeader;
			var checkBackup = gBackup.add('checkbox {text:"Backup Active Document"}');
			var gFile = gBackup.add('group {alignChildren:["left", "center"], alignment:["fill", "fill"], margins:0, spacing:0}');
				var labelFile = gFile.add('staticText {preferredSize:[58, -1], text:"Filename:"}');
				var editFile = gFile.add('editText {alignment:["fill", "fill"], text:"FILE NAME.INDD", borderless:true}');
				var gBuffer = gFile.add('group {alignment:["fill", ""]}');
			var gPath = gBackup.add('group {alignChildren:["left", "center"], alignment:["fill", "fill"], margins:0, spacing:0}');
				var labelPath = gPath.add('staticText {preferredSize:[58, -1], text:"Location:"}');
				var editPath = gPath.add('editText {alignment:["fill", "fill"], text:"FILE PATH TO MY DOCUMENTS", borderless:true}');
				var bBrowse = gPath.add('iconbutton', undefined, folderIcon, {name:'browseIcon'});
//				var bPath = gPath.add('button {text:"Browse", enabled:true, helpTip:"Browse to a different folder", alignment:["fill", "fill"]}');
		var gButtons = gExecute.add('group {orientation:"column", margins:0, spacing:0, alignChildren:["", "fill"]}');
			var bRun = gButtons.add('button {text:"Run", enabled:false, helpTip:"Runs the selected functions."}');
			var bCancel = gButtons.add('button {text:"Cancel", name:"cancel", helpTip:"Cancel the script."}');
				bCancel.onClick = function (){	$.writeln(bPath.size); w.close();	};

w.show();

function check(i){
	if (i == 7)
		check4.value = check5.value = check7.value;
	else if (i == "undefined")
		check0.value = check1.value = check2.value = check3.value = check4.value = check5.value = check7.value = check8.value = check9.value;
	$.writeln(i + "\t" + checks[i]);
	bRun.enabled = canRun();
}

function canRun(){
	for (var r = 0; r < checks.length; r++){
		if (eval(checks[r]).value == true)
			return true;
	}
	return false;
}

/*				switch (i) {
					case 0:
						check0 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 1:
						check1 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 2:
						check2 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 3:
						check3 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 4:
						check4 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 5:
						check5 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 6:
						check6 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 7:
						check7 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 8:
						check8 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
					case 9:
						check9 = gCheckbox.add('checkbox {preferredSize:[18, 18], alignment:["right", "center"]}');
						break;
				}
*/

//				name = gFuncName.add('staticText {alignment:["left", "center"], characters:20, text:funcNames.item(i)}');
