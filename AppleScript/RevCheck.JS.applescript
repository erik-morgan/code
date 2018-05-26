var app = Application.currentApplication(), se = Application('System Events'), xl = Application('Microsoft Excel');
app.includeStandardAdditions = true;
var fileNames, pullDraw = [], pullSpec = [];
var wb = (xl.workbooks.length == 1 && xl.activeWorkbook.name() == 'DrawingList.xlsx') ? xl.activeWorkbook : xl.openWorkbook({workbookFileName:'/Users/HD6904/DRAWING_TEST/DrawingList.xlsx'});
var ws = wb.activeSheet;
var login = getNetLogin();
updateData();
getRevs();
compareRevs();
//replaceSpecSheets();

function updateData(){
    fileNames = app.doShellScript('find /Users/HD6904/DRAWING_TEST -path */~*pdf -exec basename -s \'.pdf\' "{}" ";"').split('\r');
    for (var i = 1; i <= fileNames.length; i++){
        var data = fileNames[i-1].split('.');
        ws.ranges['A' + i + ':C' + i].value = data;
    }
}

function getRevs(){
    for (var i = 1; i <= fileNames.length; i++){
        var pn = fileNames[i-1].split('.');
        if (pn[1] == '-' ){
            var src = app.doShellScript('curl --anyauth -u ' + login + ' http:\/\/houston/ErpWeb/PartDetails.aspx?PartNumber=' + pn[0] + ' | grep -E revisionNum');
            var srcrev = src.replace(/^.+>([A-Z0-9]+)<.+$/mg, '$1');
            revs = ['-', srcrev.replace(/0|NR/mg, 'NC')];
        }
        else if (pn[2] == '-'){
            var src = app.doShellScript('curl --anyauth -u ' + login + ' http:\/\/houston/ErpWeb/PartDetails.aspx?PartNumber=' + pn[0] + ' | grep -E revisionNum');
            var srcrev = src.replace(/^.+>([A-Z0-9]+)<.+$/mg, '$1');
            revs = [srcrev.replace(/0|NR/mg, 'NC'), '-'];
        }
        else {
            var src = app.doShellScript('curl --anyauth -u ' + login + ' http:\/\/houston/ErpWeb/PartDetails.aspx?PartNumber=' + pn[0].replace(/-\d+$/, '') + ' http:\/\/houston/ErpWeb/PartDetails.aspx?PartNumber=' + pn[0] + ' | grep -E revisionNum');
            var revs = src.replace(/^.+>([A-Z0-9]+)<.+$/mg, '$1');
            revs = revs.replace(/0|NR/mg, 'NC').split('\r');
        }
        ws.ranges['E' + i + ':F' + i].value = revs;
    }
    wb.save();
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
            else {
                pn = pn.replace(/-\d\d$/, '');
                if (pullDraw.length > 0 && pullDraw[pullDraw.length - 1][0] !== pn) pullDraw.push([pn, revOld[0], revNew[0]]);
                else pullDraw.push([pn, revOld[0], revNew[0]]);
            }
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
        var temp = app.doShellScript('/bin/bash /Users/HD6904/DRAWING_TEST/replaceSpecSheets.sh ' + shArgs[0] + ' ' + shArgs[1] + ' ' + shArgs[2] + ' ' + shArgs[3]);
    }
}

function saveDrawingPull(){
    var logPath = app.doShellScript('dirname ' + app.pathTo(this)) + '/pull-list.txt';
    var logFile = app.openForAccess(Path(logPath), {writePermission:true});
    app.setEof(logFile, {to:0});
    app.write(pullDraw.join('\r'), {to:logFile, startingAt:app.getEof(logFile)});
    app.closeAccess(logFile);
}

function val(rev){
    if (/^(NC|NR|0|-)$/.test(rev)) return 0;
    else return (rev.length == 1) ? (rev.charCodeAt(0)-64) : (rev.charCodeAt(0)-64) + (rev.charCodeAt(1)-64);
}

function targetFolder(pn){
    if (/\d-\d{6}(-\d{2,3})?/.test(pn)){
        if (pn[0] == '2') return '/Users/HD6904/DRAWING_TEST/~2-';
        else if (pn[0] == '4') return '/Users/HD6904/DRAWING_TEST/~4-';
        else if (pn[0] == '6') return '/Users/HD6904/DRAWING_TEST/~6-';
        else if (pn[0] == '7') return '/Users/HD6904/DRAWING_TEST/~7-';
    }
    else return '/Users/HD6904/DRAWING_TEST/~X-';
}

function getNetLogin(){
    return app.doShellScript('key="/Users/HD6904/Library/Keychains/login.keychain"; security unlock-keychain -p "" $key; security find-internet-password -g usportal $key | grep "acct"; security find-internet-password -w usportal $key').replace(/^.+="([^"]+)"\r(.+)/m, '$1:$2');
}