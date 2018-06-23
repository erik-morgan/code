#target indesign

/*
 * IF I END UP OPENING ALL OF THESE PROCEDURES ANYWAY, I MIGHT AS WELL
 * DO THE OTHER STUFF
 * 
 * SINCE THIS IS JUST SLASHES TO DASHES, I COULD JUST SPLIT THE FILE NAME &
 * CLEAN THAT PART OF IT...
 * 
 * DECISION MADE: PROCEED AS IF WE'RE STANDARDIZING THE NAMING (SS0267.R14.indd)
 * 
 * USING FRACTIONS DICT B/C REGX, WHILE CLEVER, WOULD CHANGE STUFF LIKE 
 * 18/16" WEAR SLEEVE TO 1.125
 *     filename = filename.replace(/(?:-| )?(\d+)\/(2|4|6|8|16)/g, function(match, n1, n2){return (parseInt(n1, 10)/parseInt(n2, 10)).toString().substring(1);});
 *     return fileName.replace(/(\/|"|\*)/g, '');
 */

var fileList = File.openDialog('Select the file listing the paths to process:');
fileList.open();
var slash = File.fs == 'Macintosh' ? ':' : '/',
    ends = fileList.lineFeed == 'Windows' ? '\r\n' : '\n',
    paths = fileList.read().split(ends);
fileList.close();

app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
app.findChangeGrepOptions.includeMasterPages = true;

for (var p = 0; p < paths.length; p++) {
    if (!File(paths[p]).exists)
        continue;
    var f = File(paths[p]),
        doc = app.open(f),
        name = procName(f.name),
        footers = doc.findGrep();
    for (var f = 0; f < footers.length; f++) {
        footers[f].contents = footers[f].contents.replace('/', '-');
    }
    doc.save(File(f.path + '/' + name + '.indd'));
    doc.exportFile(ExportFormat.PDF_TYPE, 
                   File(f.path + '/' + name + '.pdf'), false);
    doc.close(SaveOptions.NO);
    f.remove();
}

function procName (fname) {
    var rpid = fname.split(' ')[0],
        sys = /^[A-Z]+/i.exec(rpid)[0],
        num = rpid.substr(sys.length).replace(/\W/g, '-'),
        rev = /\br(\d+)\b/i.exec(fname);
    if (/-[A-Z]+/i.test(num))
        num = num.replace(/-(?=[A-Z])/gi, '');
    app.findGrepPreferences.findWhat = 
        '(?i)\\A' + sys + ' ?' + num.substr(0, 4) + '.+';
    return sys + num + (rev ? '.R' + rev[1] : '');
}
