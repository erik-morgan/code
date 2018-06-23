/*
 * RUN ON MACINTOSH, NOT WINDOWS
 * USE FILE TYPE INFO TO ENSURE THAT EVERY FILE HAS AN EXTENSION
 * REMOVE DEAD FILES (SHOW UP AS EXECUTABLE ON MACS)
 * REPLACE FRACTIONS WITH DECIMALS
 * REPLACE INVALID CHARACTERS WITH NOTHING (<, >, :, ", /, \, |, ?, *, NUL, TAB, CR, LF)
 * TRY TO AVOID THESE CHARACTERS AS WELL, ALTHOUGH TECHNICALLY ONLY IN SHORTNAMES (+, ,, ;, =, [, ])
 * 
 * LIST CHANGES (EG FRACTIONS TO DECIMALS, SLASHES TO DASHES, ETC) FOR RELINKING
 * OR 
 * KEEP LIST OF FILENAMES SO I CAN JUST MAP OLD NAME TO NEW NAME USING SAME SPREADSHEET
 * 
 */

var fileList = File.openDialog('Select the file listing the paths to process:');
fileList.open();
var ends = fileList.lineFeed == 'Windows' ? '\r\n' : '\n',
    lines = fileList.read().split(ends);

for (var l = 0; l < lines.length; l++) {
    var line = lines[l],
        path = line.split('\t')[0],
        name = line.split('\t')[1];
    if (!File(path).exists)
        continue;
    if (name)
        File(path).rename(name);
    else
        File(path).remove();
}
