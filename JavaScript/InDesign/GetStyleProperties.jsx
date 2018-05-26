var doc = app.activeDocument;
var log = new File(doc.filePath.parent.parent + "/Properties.txt");
log.encoding = "UTF-8";
log.open("w");
var styles = ['[Basic Paragraph]', 'call out', 'caption', 'Draft Text', 'footer', 'full body', 'Gutter Text', 'Level 1 (18 pt)', 'Level 1 (24 pt)', 'Level 2', 'Level 2 (Tools)', 'Level 3', 'Level 4', 'Level 5', 'New Body', 'Normal', 'Note', 'Note Bullets', 'Page No.', 'Procedure Designator', 'RUNNING THE', 'sub body', 'SUGGESTED PROCEDURE', 'TOC', 'TOC Level 2', 'TOC Level 2 (Tools)', 'TOC Level 3', 'TOC Level 4', 'TOC Level 5', 'TOC Parts List', 'TOC title', 'Tool List', 'Tool List 2'];
var props = ['appliedFont', 'autoLeading', 'basedOn', 'capitalization', 'fillColor', 'firstLineIndent', 'fontStyle', 'hyphenateLadderLimit', 'hyphenation', 'justification', 'keepAllLinesTogether', 'keepFirstLines', 'keepLastLines', 'keepLinesTogether', 'keepWithNext', 'leading', 'leftIndent', 'maximumLetterSpacing', 'maximumWordSpacing', 'minimumLetterSpacing', 'minimumWordSpacing', 'name', 'nextStyle', 'pointSize', 'rightIndent', 'ruleAboveColor', 'ruleAboveTint', 'ruleBelow', 'ruleBelowColor', 'ruleBelowLineWeight', 'ruleBelowOffset', 'ruleBelowRightIndent', 'ruleBelowTint', 'spaceAfter', 'spaceBefore', 'strokeColor', 'strokeWeight', 'tabList'];

for (i = 0; i < styles.length; i++){
    var style = doc.paragraphStyles.itemByName(styles[i]);
    for (j = 0; j < props.length; j++){
        if (props[j] == 'tabList'){
            var tabList = style[props[j]];
            if (tabList.length > 0){
                for (k = 0; k < tabList.length; k++){
                    if (tabList[k].alignment == "CHARACTER_ALIGN"){    var alignChar = ", alignmentCharacter:" + tabList[k].alignmentCharacter;    }
                    else {    var alignChar = "";    }
                    if (tabList.length == 1)
                        log.write("[{position" + tabList[k].position + ", alignment:TabStopAlignment." + tabList[k].alignment + ", leader:" + tabList[k].leader + alignChar + "}]");
                    else if (k == 0)
                        log.write("[{position" + tabList[k].position + ", alignment:TabStopAlignment." + tabList[k].alignment + ", leader:" + tabList[k].leader + alignChar + "}");
                    else if (k == tabList.length-1)
                        log.write("{position" + tabList[k].position + ", alignment:TabStopAlignment." + tabList[k].alignment + ", leader:" + tabList[k].leader + alignChar + "}]");
                    else
                        log.write(",{position" + tabList[k].position + ", alignment:TabStopAlignment." + tabList[k].alignment + ", leader:" + tabList[k].leader + alignChar + "}");
                }
            }
        }
        else {
            if (contains(style[props[j]].constructor.name, ['Number', 'Boolean', 'String', 'Enumerator', 'Array'])){
                log.write(style[props[j]]);
            }
            else {
                log.write(style[props[j]].name);
            }
        }
        log.write('\t');
    }
    log.write("\r");
}
log.close();
log.execute();

function contains(theItem, theArray){
    for (z = 0; z < theArray.length; z++){
        var arrayItem = theArray[z];
        if (theItem == arrayItem){
            return true;
        }
    }
    return false;
}