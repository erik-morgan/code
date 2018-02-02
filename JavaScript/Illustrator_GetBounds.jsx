#target illustrator
var log = File('Users/HD6904/Desktop/Drawings/Assembly Drawings/DocMeasurements.txt');
log.encoding = 'UTF-8';
log.open('w');
log.writeln('Name\tArtboard Width\tArtboard Height\tDrawing Width\tDrawing Height');
//var root = Folder('Users/HD6904/Desktop/Drawings/Assembly Drawings/');
var folders = [Folder('Users/HD6904/Desktop/Drawings/Assembly Drawings/~4-'), Folder('Users/HD6904/Desktop/Drawings/Assembly Drawings/~6-'), Folder('Users/HD6904/Desktop/Drawings/Assembly Drawings/~International')];
//folders = root.getFiles(isFolder);

for (i = 0; i < folders.length; i++){
    var files = folders[i].getFiles('*.pdf');
    for (j = 0; j < files.length; j++){
        var doc = app.open(files[j]);
        if (doc.layers[0].pageItems[0].typename == 'GroupItem' && doc.groupItems[0].clipped){
            doc.groupItems[0].pathItems[0].remove();
        }
        var name = files[j].name.split('.')[0];
        var artboardW = Math.abs(round(doc.artboards[0].artboardRect[2] - doc.artboards[0].artboardRect[0], 5));
        var artboardH = Math.abs(round(doc.artboards[0].artboardRect[3] - doc.artboards[0].artboardRect[1], 5));
        var drawingW = Math.abs(round(doc.geometricBounds[2] - doc.geometricBounds[0], 5));
        var drawingH = Math.abs(round(doc.geometricBounds[3] - doc.geometricBounds[1], 5));
        log.writeln(name + '\t' + artboardW + '\t' + artboardH + '\t' + drawingW + '\t' + drawingH);
        doc.close(SaveOptions.DONOTSAVECHANGES);
    }
}

log.close();
log.execute();

function isFolder(fileObj){
    if (fileObj.constructor.name == 'Folder'){
        return true;
    }
    else {
        return false;
    }
}

function round(num, dec){
    return Number(Math.round(num + ('e' + dec)) + ('e-' + dec));
}
