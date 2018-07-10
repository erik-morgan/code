#target indesign
#include "polyfills.jsx";
#include "procedure.jsx";

/*
 * STANDARDIZE STYLE SHEETS (INCLUDES CLEANING UP MANUALLY ENTERED NUMBERED LIST)
 * USE METADATA INSTEAD OF LOGGING, THEN EXTRACT & USE METADATA IN SEPARATE SCRIPTS
 * ALSO WRITE A COMPANION METADATA SCRIPT THAT AUTOMATICALLY UPDATES XMP DATA ON SAVE
 * AND PLACE IT INTO STARTUP SCRIPTS
 * 
 * MERGE WITH procedure.jsx
 */

Folder.current = File($.fileName).parent;
fileList = File('file_paths.txt');
failLog = File('process_fail_log.txt');
styleSheet = app.scriptPreferences.scriptsFolder.getFiles('TWD Stylesheet.indd')[0];

try {
    initProcess();
} catch (e) {
    ExternalObject.AdobeXMPScript.terminate();
}

function initProcess () {
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    if (!ExternalObject.AdobeXMPScript)
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    if (!(styleSheet && styleSheet.exists))
        throw Error('styleSheet does not exist!\n\n' +
                    'All referenced files must be in the same folder as this script.');
    if (!(fileList && fileList.exists))
        throw Error('fileList does not exist!\n\n' +
                    'All referenced files must be in the same folder as this script.');
    Procedure.prototype.styleSheet = styleSheet;
    delete styleSheet;
    fileList.open();
    filePaths = fileList.read().split(/[\n\r]+/);
    fileList.close();
    main();
}

function main () {
    // consider removing object.extend & just doing it the normal way
    // add some kind of progress dialog
    filePaths.forEach(function (path) {
        if (!File(path).exists)
            continue;
        var proc = new Procedure(File(path));
        try {
            proc.process();
        } catch (e) {
            // add process method to procedure
            // should encapsulate each call in a try/catch, and
            // throw a new error with func name, maybe a custom msg.
            // this catch should catch that error, close the doc, 
            // destroy the instance, & log the problems
            // ALSO, DECIDE WHETHER TO INCLUDE ADDXMP IN PROTOTYPE EXTENSION
        }
    });
}

function addXMP () {
    var fxmp, xmp, ns = 'http://dril-quip.com/rp/';
    fxmp = new XMPFile(doc.fullName.fsName, XMPConst.FILE_INDESIGN, XMPConst.OPEN_FOR_UPDATE);
    xmp = fxmp.getXMP();
    XMPMeta.registerNamespace(ns, 'rp');
    // USE DATA OBJECT FOR PROPERTY ASSIGNMENT
    xmp.setProperty(ns, 'id', name[1]);
    xmp.setProperty(ns, 'revision', name[3] || 0);
    xmp.setProperty(ns, 'title', title);
    xmp.setProperty(ns, 'system', system);
    if (DATA.modified)
        xmp.setProperty(ns, 'modified', DATA.modified);
    if (DATA.writers)
        XMPUtils.separateArrayItems(xmp, ns, 'writers', XMPConst.SEPARATE_ALLOW_COMMAS, DATA.writers.join('\t'));
    XMPUtils.separateArrayItems(xmp, ns, 'links', XMPConst.SEPARATE_ALLOW_COMMAS, DATA.links.join('\t'));
    fxmp.putXMP(xmp);
    fxmp.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
}

function grep (findPrefs, changePrefs, masters) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findChangeGrepOptions.includeMasterPages = masters ? true : false;
    app.findGrepPreferences.properties = findPrefs;
    app.changeGrepPreferences.properties = changePrefs ? changePrefs : {};
    return changePrefs ? doc.changeGrep() : doc.findGrep();
}

function log () {
    
}