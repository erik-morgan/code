#target indesign

var doc, styleSheet = app.scriptPreferences.scriptsFolder.getFiles('TWD Stylesheet.indd')[0];

doc = app.activeDocument;

copyStyles();
importStyles();

function copyStyles () {
    var styles = [], entries = [];
    for (var s = 1; s < doc.tocStyles.length; s++) {
        styles.push(doc.tocStyles[s].properties);
        entries.push(doc.tocStyles[s].tocStyleEntries.everyItem().properties);
    }
    doc.close(SaveOptions.NO);
    doc = app.activeDocument;
    if (doc.tocStyles.length > 1)
        doc.tocStyles.itemByRange(1, -1).remove();
    for (var i = 0; i < styles.length; i++) {
        var entryList = entries[i],
            newStyle = doc.tocStyles.add();
        newStyle.properties = styles[i];
        for (var e = 0; e < entryList.length; e++) {
            var entry = newStyle.tocStyleEntries.add();
            entry.properties = entryList[e];
        }
    }
}

function importStyles () {
    doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, styleSheet);
}
