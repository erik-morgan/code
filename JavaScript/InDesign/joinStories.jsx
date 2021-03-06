#target indesign
var docs = app.documents;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.preflightOptions.preflightOff = true;
for (var i = 0; i < docs.length; i++){
    var doc = app.documents[i];
    var parArray = [];
    for (var p = 0; p < doc.pages.length; p++){
        var pg = doc.pages[p];
        var paras = [];
        for (var f = 0; f < pg.textFrames.length; f++){
            var tf = pg.textFrames[f];
            for (var n = 0; n < tf.paragraphs.length; n++){
                var para = tf.paragraphs[n];
                if (!/^\s+(\r|\n)/.exec(para.contents)){
                    if (para.contents.search(/\r|\n/) == -1){
                        para.insertionPoints[-1].contents = '\r';
                    }
                    paras.push(para);
                }
            }
        }
        paras.sort(function (a, b){ return a.characters[0].baseline - b.characters[0].baseline; });
        parArray = parArray.concat(paras);
    }
    parArray.reverse();
    var frames = [];
    for (var p = doc.pages.length - 1; p > -1; p--){
        var pg = doc.pages[p];
        var x1 = (pg.documentOffset % 2 == 0) ? pg.bounds[1] + doc.marginPreferences.right : pg.bounds[1] + doc.marginPreferences.left;
        var x2 = x1 + (doc.documentPreferences.pageWidth - doc.marginPreferences.left - doc.marginPreferences.right);
        var y1 = doc.marginPreferences.top;
        var y2 = pg.bounds[2] - doc.marginPreferences.bottom;
        var newFrame = pg.textFrames.add({geometricBounds:[y1,x1,y2,x2]});
        frames.push(newFrame);
        if (p == 0){
            var mainStory = newFrame.parentStory;
            for (var x = 0; x < parArray.length; x++){
                if (x > 0 && parArray[x].contents !== mainStory.paragraphs[0].contents){
                    parArray[x].move(LocationOptions.AT_BEGINNING, mainStory);
                }
                else if (x == 0){
                    parArray[x].move(LocationOptions.AT_BEGINNING, mainStory);
                }
            }
        }
    }
    frames.reverse();
    for (var f = 0; f < (frames.length - 1); f++){
        frames[f].nextTextFrame = frames[f + 1];
        frames[f].sendToBack();
    }
    var mainStory = frames[0].parentStory;
    for (var p = 0; p < doc.pages.length; p++){
        for (var f = doc.pages[p].textFrames.length - 1; f > -1; f--){
            if (doc.pages[p].textFrames[f].parentStory !== mainStory){
                doc.pages[p].textFrames[f].remove();
            }
        }
    }
    if (doc.documentPreferences.pageSize !== 'Letter'){
        doc.layoutAdjustmentPreferences.properties = {allowGraphicsToResize:true, allowRulerGuidesToMove:true, enableLayoutAdjustment:true, ignoreObjectOrLayerLocks:true};
        doc.documentPreferences.pageSize = 'Letter';
        doc.layoutAdjustmentPreferences.enableLayoutAdjustment = false;
        doc.save();
    }
}
app.preflightOptions.preflightOff = false;
