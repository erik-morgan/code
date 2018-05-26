// Title: AutoSaveIDML.jsx
// Creator: Erik Morgan
// Contact: morgan.erik@outlook.com
// 
// Creates an event listener for every saving scenario,
// so that when a save event occurs, an IDML document
// of the same name will be saved in the same location.
// Intended to be used as a 'startup script,' so that
// the IDML file is created automatically.
// 
// Installation Instructions:
// Windows: C:\Program Files\Adobe\Adobe InDesign [CC/CS] [Version/Year]\Scripts\startup scripts\
// macOS: [HD Name]/Library/Preferences/Adobe InDesign/Version 5.0/Scripts
// 
// If neither of these locations work for you, then open
// InDesign, open the Scripts palette, right-click on
// either Application/User folder, and select 'Reveal in
// Explorer/Finder'. Navigate up one level, which should
// be to a folder named 'Scripts,' and create a new
// folder called 'Startup Scripts.' Put the script
// into this folder, and you're done!
// 
// For example, the location of my User scripts folder
// is C:\Users\Erik\AppData\Roaming\Adobe\InDesign\Version 12.0\en_US\Scripts\,
// so I would just add a 'Startup Scripts' folder to that location.
// 
// Note: If InDesign is running when the script is placed into the folder,
// then you will have to quit the application before the script will take
// effect.

#target indesign
#targetengine 'session'

eSave = app.eventListeners.item('save');
eSaveAs = app.eventListeners.item('saveAs');
eSaveCopy = app.eventListeners.item('saveCopy');

if (!eSave.isValid){
    eSave = app.addEventListener('afterSave', saveHandler);
    eSave.name = 'save';
}
if (!eSaveAs.isValid){
    eSaveAs = app.addEventListener('afterSaveAs', saveHandler);
    eSaveAs.name = 'saveAs';
}
if (!eSaveCopy.isValid){
    eSaveCopy = app.addEventListener('afterSaveACopy', saveHandler);
    eSaveCopy.name = 'saveCopy';
}

function saveHandler(e){
    if (app.layoutWindows.length > 0){
        var doc = app.activeDocument;
        var inddPath = doc.fullName;
        var idmlPath = inddPath.toString().replace(/\.indd/, '.idml');
        var idmlFile = File(idmlPath);
        doc.exportFile(ExportFormat.INDESIGN_MARKUP, idmlFile, false);
    }
    else {
        alert('There are no documents open. This theoretically can\'t happen, so contact Erik if it does.', undefined, true);
    }
}