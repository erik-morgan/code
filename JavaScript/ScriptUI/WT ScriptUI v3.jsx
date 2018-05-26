#target indesign
var checkBackup, tfBackup, check0, check1, check2, check3, check4, check5, check6, check7, check8, date = new Date();
var dateStamp = ('0' + (date.getMonth() + 1).toString()).substr(-2) + ('0' + (date.getDate().toString())).substr(-2) + date.getFullYear().toString() + ' ' + ('0' + date.getHours().toString()).substr(-2) + ('0' + date.getMinutes().toString()).substr(-2) + ('0' + date.getSeconds().toString()).substr(-2);
var defaultLocation = Folder.myDocuments.fsName.replace(/\\/g, '\/') + '/WT Backups';
if (!Folder(defaultLocation).exists){
    Folder(defaultLocation).create();
}
var docName = File.decode($.fileName).replace(RegExp('/~|.+/|\.jsx', 'ig'), '');
var descs = ['• Removes ALL guides from the document\r• Inserts correct guides only on the master spread\r• Applies to locked guides', '• Removes ALL graphics from the master spread\r• Correctly places/scales \'DQ Logo\' from the network onto the master spread\r• Uses Sam\'s Club Art\'s logo if footer contains \'BA\', or TWD\'s logo if not', '• Saves the contents of each footer, and removes ALL master spread text frames\r• Recreates each footer with correct alignment and dimensions\r• Does not alter the footer\'s contents', '• Straightens and properly positions incorrect text frames\r• Only affects text frames threaded with the main story\r• Applies to locked text frames', '• If a DQ swatch exists, then its color model, space, and value will be corrected\r• If a DQ swatch doesn\'t exist, then it will be added\r• If any non-DQ swatches (besides the 4 defaults) exist, they will be removed', '• Removes EVERY rectangle whose fill color is \'Black\', regardless of tint\r• Excludes items on the master spread\r• Applies to locked page items', '• If a DQ paragraph style exists, then it\'s properties are set to the correct value\r• If a DQ paragraph style doesn\'t exist, then it will be added\r• If any non-DQ paragraph styles (besides the 2 defaults) exist, they will be removed', '• Finds all paragraphs with \'Note\' or \'Note Bullets\' paragraph style applied\r• Correctly formats each note, and creates a gray box underneath the note\'s text\r• Runs ClearBoxes and ResetColors by default, and applies to locked text frames', '• Corrects page order of grouped items and fixes their text wrap settings\r• Excludes items on the master spread\r• Applies to locked page items'];
var names = ['FixGuides', 'FixLogos', 'AlignFooters', 'FixFrames', 'ResetColors', 'ClearBoxes', 'ResetStyles', 'NoteBoxes', 'FixGroups'];
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
        gBottom.alignment = ['fill', 'fill'];
        gBottom.margins = 6;
        gBottom.spacing = 6;
        gBottom.graphics.backgroundColor = fillHeader;
        var checkBackup = gBottom.add('checkbox', undefined, undefined);
            checkBackup.preferredSize = [18, 18];
            checkBackup.alignment = ['left', 'center'];
            checkBackup.onClick = function (){
                (checkBackup.value) ? addBackupPanel() : removeBackupPanel();
            };
        var labelBackup = gBottom.add('staticText', undefined, 'Backup the active document');
            labelBackup.alignment = ['left', 'center'];
            labelBackup.graphics.foregroundColor = penWhite;
        var gSpacing0 = gBottom.add('group');
            gSpacing0.alignment = ['fill', 'fill'];
        var bRun = gBottom.add('button', undefined, 'Run');
            bRun.alignment = ['right', 'fill'];
            bRun.enabled = false;
            bRun.preferredSize = [150, -1];
        var bCancel = gBottom.add('button', undefined, 'Cancel');
            bCancel.alignment = ['right', 'fill'];
            bCancel.preferredSize = [150, -1];
/*
    var gBottom = w.add('group');
        gBottom.preferredSize = [640, 60];
        gBottom.alignment = gBottom.alignChildren = ['fill', 'fill'];
        gBottom.margins = 6;
        gBottom.spacing = 0;
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
            gButtons.margins = 0;
            gButtons.spacing = 6;
            gButtons.graphics.backgroundColor = fillHeader;
            var bRun = gButtons.add('button', undefined, 'Run');
                bRun.enabled = false;
                bRun.helpTip = 'Runs the selected functions';
                bRun.size = [150, -1];
            var bCancel = gButtons.add('button', undefined, 'Cancel', {name:'cancel'});
                bCancel.helpTip = 'Cancels the entire script';
                bCancel.size = [150, -1];
                bCancel.onClick = function (){$.writeln(gButtons.margins); w.close();};
*/
w.show();

function check(i){
    if (i == 7){
        check4.value = check5.value = check7.value;
    }
    if (i == undefined){
        check0.value = check1.value = check2.value = check3.value = check4.value = check5.value = check6.value = check7.value = check8.value = checkAll.value;
    }
    bRun.enabled = canRun();
    //                                                        just put entire canRun function above this
}

function canRun(){
    checkBoxes = [check0, check1, check2, check3, check4, check5, check6, check7, check8];
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
                var editFile = gFile.add('editText', undefined, docName.replace(/ .+/, '') + ' ' + dateStamp + '.indd', {borderless:true});
                    editFile.characters = 64;
            var gPath = p.add('group');
                gPath.margins = gPath.spacing = 0;
                gPath.alignChildren = ['left', 'center'];
                var labelPath = gPath.add('staticText', undefined, 'Location:');
                    labelPath.characters = 8;
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
//    $.writeln('labelFile:' + labelFile.characters + 'chars' + '\t' + labelFile.size.width + '\r' + 'labelPath:' + labelPath.characters + 'chars' + '\t' + labelPath.size.width + '\r' + (labelFile.size.width - labelPath.size.width)/(labelFile.characters - labelPath.characters));
}

function removeBackupPanel(){
    w.remove(w.children.length - 1);
    w.center();
    w.layout.layout(true);
}