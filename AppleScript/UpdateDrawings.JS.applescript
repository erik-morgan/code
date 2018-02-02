var app = Application.currentApplication(), se = Application('System Events'), xl = Application('Microsoft Excel');
app.includeStandardAdditions = true;
var fileNames, pullDraw = [], pullSpec = [];
var wb = (xl.workbooks.length == 1 && xl.activeWorkbook.name() == 'Drawings.xlsx') ? xl.activeWorkbook : xl.openWorkbook({workbookFileName:'/Users/HD6904/DRAWING_TEST/Drawings.xlsx'});
var ws = wb.worksheets['DWGS'];
var login = 'morganel:' + getNetPass();
updateData();
getRevs();
compareRevs();
replaceSpecSheets();
if (UI() == 'CONTINUE') replaceDrawings();

function updateData(){
    fileNames = app.doShellScript('find /Users/HD6904/DRAWING_TEST -path */~*pdf -exec basename "{}" ";"').split('\r');
    for (var i = 1; i <= fileNames.length; i++){
        var data = fileNames[i-1].replace(/\.pdf/i, '').split('.');
        if (data.length == 2) ws.ranges['B' + i + ':C' + i].merge();
        ws.ranges['A' + i + ':C' + i].value = data;
    }
}

function getRevs(){
    var numRows = ws.usedRange.rows.length;
    for (var r = 1; r <= numRows; r++){
        var pn = ws.cells['A' + r].value();
        if (fileNames[r-1].replace(/\.pdf/i, '').split('.').length == 2){
            var src = app.doShellScript('curl --anyauth -u morganel:Password20 http:\/\/houston/ErpWeb/PartDetails.aspx?PartNumber=' + pn + ' | grep -E revisionNum');
        }
        else {
            var src = app.doShellScript('curl --anyauth -u morganel:Password20 http:\/\/houston/ErpWeb/PartDetails.aspx?PartNumber=' + pn.replace(/-\d+$/, '') + ' http:\/\/houston/ErpWeb/PartDetails.aspx?PartNumber=' + pn + ' | grep -E revisionNum');
        }
        var revs = src.replace(/^.+>([A-Z0-9]+)<.+$/mg, '$1');
        revs = revs.replace(/0|NR/mg, 'NC').split('\r');
        if (revs.length == 1) ws.ranges['E' + r + ':F' + r].merge();
        ws.ranges['E' + r + ':F' + r].value = revs;
    }
    ws.save();
}

function compareRevs(){
    var numRows = ws.usedRange.rows.length;
    for (var r = 1; r <= numRows; r++){
        var pn = ws.cells['A' + r].value();
        var revOld = ws.ranges['B' + r + ':C' + r].value()[0];
        var revNew = ws.ranges['E' + r + ':F' + r].value()[0];
        if (val(revOld[0]) < val(revNew[0])){
            ws.cells['E' + r].interiorObject.color = [255, 0, 0];
            if (revOld.length == 1) pullDraw.push([pn, revNew[0]]);
            else if (pullDraw[pullDraw.length - 1][0] !== pn) pullDraw.push([pn.replace(/-\d{2,3}$/, ''), revOld[0], revNew[0]]);
        }
        if (revOld.length == 2 && val(revOld[1]) < val(revNew[1])){
            pullSpec.push([pn].concat(revNew));
            ws.cells['F' + r].interiorObject.color = [255, 0, 0];
        }
    }
    saveDrawingPull();
}

function replaceSpecSheets(){
    for (var i = 0; i < pullSpec.length; i++){
        var shArgs = [pullSpec[i][0].replace(/-\d{2,3}$/, ''), pullSpec[i][0], '/Users/HD6904/DRAWING_TEST/HOPPER/', pullSpec[i].join('.') + '.pdf'];
        var temp = app.doShellScript('/bin/bash /Users/HD6904/DRAWING_TEST/replaceSpecSheets.sh "' + shArgs[0] + '" "' + shArgs[1] + '" "' + shArgs[2] + '" "' + shArgs[3] + '"');
    }
}

function replaceDrawings(){
    for (var i = 0; i < pullDraw.length; i++){
        if (/-\d{2,3}$/.test(pullDraw[i][0])){
            var shArgs = [pullDraw[i][0], pullDraw[i][1], '/Users/HD6904/DRAWING_TEST/HOPPER/'];
            var temp = app.doShellScript('/bin/bash /Users/HD6904/DRAWING_TEST/replaceDrawings.sh "' + shArgs[0] + '" "' + shArgs[1] + '" "' + shArgs[2] + '"');
        }
        else {
            var shArgs = [pullDraw[i][0], pullDraw[i][1], pullDraw[i][2], '/Users/HD6904/DRAWING_TEST/HOPPER/'];
            var temp = app.doShellScript('/bin/bash /Users/HD6904/DRAWING_TEST/replaceDrawings.sh "' + shArgs[0] + '" "' + shArgs[1] + '" "' + shArgs[2] + '" "' + shArgs[3] + '"');
        }
    }
}
    
function saveDrawingPull(){
    var logFile = app.openForAccess(app.doShellScript('dirname "' + app.pathTo(this) + '"') + '/Drawing_Pull_List.txt', {writePermission:true});
    app.setEof(logFile, {to:0});
    app.write(pullDraw.join('\r'), {to:logFile, startingAt:app.getEof(logFile)});
    app.closeAccess(logFile);
}

function val(rev){
    if (rev == 'NC') return 0;
    else return (rev.length == 1) ? (rev.charCodeAt(0)-64) : (rev.charCodeAt(0)-64) + (rev.charCodeAt(1)-64);
}

function getNetPass(){
    var key = '/Users/HD6904/Library/Keychains/login.keychain';
    var cmd = 'security unlock-keychain -p "" ' + key + '; security find-internet-password -w usportal ' + key;
    return app.doShellScript(cmd);
}

function UI(){
    return app.displayDialog('Select CONTINUE to process the drawing files in the HOPPER folder, or CANCEL to exit.', {defaultButton:'CONTINUE', cancelButton:'CANCEL', withIcon:'note'}).buttonReturned();;
}