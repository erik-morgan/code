#target indesign

var doc = app.documents[1],
    styleSheet = app.activeDocument.fullName;

// copyStyles();
importStyles();

function copyStyles () {
    var charStyles = doc.characterStyles.everyItem().properties,
        paraStyles = doc.paragraphStyles.everyItem().properties,
        style;
    // what about nested styles?
    // does NOT include nested styles
    doc.close(SaveOptions.NO);
    doc = app.activeDocument;
    for (var c = 0; c < charStyles.length; c++) {
        style = charStyles[c];
        if (doc.characterStyles.item(style.name).isValid)
            doc.characterStyles.item(style.name).properties = style;
        else {
            var newStyle = doc.characterStyles.add();
            newStyle.properties = style;
        }
    }
    for (var p = 0; p < paraStyles.length; p++) {
        style = paraStyles[p];
        if (doc.paragraphStyles.item(style.name).isValid)
            doc.paragraphStyles.item(style.name).properties = style;
        else {
            var newStyle = doc.paragraphStyles.add();
            newStyle.properties = style;
        }
    }
}

function importStyles () {
    doc.importStyles(ImportFormat.TEXT_STYLES_FORMAT, styleSheet);
}
