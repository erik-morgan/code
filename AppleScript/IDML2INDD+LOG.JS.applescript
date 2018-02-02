app = Application.currentApplication();
app.includeStandardAdditions = true;
SystemEvents = Application('System Events');
var log = '';

test_openDocuments(app.chooseFile({multipleSelectionsAllowed:true}));

function test_openDocuments(droppedItems){
    log = log + 'droppedItems.length = ' + droppedItems.length + '\n';
    for (var item of droppedItems){
        var diskItem = SystemEvents.diskItems.byName(item.toString());
        log = log + diskItem.name() + '\n';
        var itemExt = diskItem.nameExtension();
        var itemName = diskItem.name().replace(itemExt, 'indd');
        if (itemExt.toLowerCase() == 'idml'){
            log = log + 'itemExt = ' + itemExt + '\n';
            var pathOut = diskItem.container().posixPath() + '/' + itemName;
            log = log + 'pathOut = ' + pathOut + '\n';
            toINDD(item.toString(), pathOut);
        }
    }
    writeLog(log);
}

function toINDD(docPath, savePath){
    var indd = Application('Adobe InDesign CS5.5');
    var oldLevel = indd.scriptPreferences.userInteractionLevel;
    indd.scriptPreferences.userInteractionLevel = 'never interact';
    indd.open(docPath);
    log = log + 'Opened ' + docPath + '...\n';
    var doc = indd.activeDocument;
    var theLinks = doc.links;
    log = log + '# of Links = ' + theLinks.length + '\n';
    for (i = 0; i < theLinks.length; i++){
        var aLink = theLinks[i];
        if (aLink.status() == 'link missing'){
            log = log + 'Link ' + i + ' is missing' + '\n';
            var oldPath = aLink.filePath().replace(RegExp(String.fromCharCode(61473), 'g'), '*');
            var newPath = oldPath.replace(/N:\/S/, '/Volumes/s');
            if (exists(newPath)){
                log = log + 'newPath (' + newPath + ') Exists!' + '\n';
                aLink.relink({to:Path(newPath)});
            }
        }
    }
    doc.save(savePath);
    log = log + 'Saved!\nsavePath = ' + savePath + '\n';
    indd.scriptPreferences.userInteractionLevel = oldLevel; 
}

function exists(filePath){
    var link = SystemEvents.diskItems.byName(filePath);
    if (link.exists){
        return true;
    }
    else {
        return false;
    }
}

function writeLog(log){
    var desktop = Path(app.pathTo('desktop') + '/TestLog.txt');
    var logFile = app.openForAccess(desktop, {writePermission:true});
    app.setEof(logFile, {to:0});
    app.write(log, {to:logFile, startingAt:app.getEof(logFile)});
    app.closeAccess(logFile);
    return true;
}