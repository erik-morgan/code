app = Application.currentApplication();
app.includeStandardAdditions = true;
var xl = Application('Microsoft Excel');
var procList = [], outList = [];
var ws = xl.worksheets['PDFTK'];
var numCols = ws.usedRange.columns.length;
for (var i = 0; i < numCols; i++){
	var col = ws.columns[i];
	var numRows = colCellCount(col);
	var colProcs = [];
	for (var j = 0; j < numRows; j++){
		colProcs.push('"' + col.cells[j].value() + '"');
	}
	procList.push(colProcs);
	outList.push(xl.worksheets['MANUAL NAMES'].columns[i].cells[0].value());
}
for (var i = 0; i < procList.length; i++){
	try {
		app.doShellScript('/opt/pdflabs/pdftk/bin/pdftk ' + procList[i].join(' ') + ' cat output "' + outList[i] + '"');
		console.log(i + '/' + procList.length + ' COMPLETE!');
	}
	catch (e){
		console.log(e.message);
		console.log(i + '/' + procList.length + ' FAILED! (' + e.message + ')');
	}
}

function colCellCount(col){
	return col.cells[-1].getEnd({direction:'toward the top'}).firstRowIndex();
}