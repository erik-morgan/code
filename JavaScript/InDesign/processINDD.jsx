#target indesign

/*
 * THIS SCRIPT WILL PROCESS ALL INDD FILES & COULD THEORETICALLY BE USED WITH BATCH PROCESSING SCRIPT
 * 
 * STANDARDIZE STYLE SHEETS (INCLUDES CLEANING UP MANUALLY ENTERED NUMBERED LIST)
 * RELINK ARTWORK THAT WAS RENAMED
 * ADD DOCUMENT TITLE, AUTHOR, REVISION, SYSTEM, & MAYBE LINK NAMES AS METADATA
 * RE-EXPORT PDF IF NECESSARY
 * EXTRACT FOOTER INFO, TITLE, SYSTEM, ETC FOR LOG
 * EXTRACT LINK NAMES
 * 
 * CAN'T DO FOLDER.SELECTDIALOG BC FOLDERS MAY HAVE MULTIPLE REVS
 * 
 * SHOULD ADD CHECKS FOR CANCELLED OPENDIALOGS
 * USE METADATA INSTEAD OF LOGGING, THEN EXTRACT METADATA
 */

SYSTEMS = {
    'CC': 'Casing Connector',
    'CF': 'Casing Connector',
    'CR': 'Completion Riser',
    'CS': 'Casing Reparation System',
    'CW': 'Conventional Wellhead System',
    'DR': 'Drilling Riser System',
    'DT': 'Dril-Thru System',
    'DV': 'Valve System',
    'FD': 'Fixed Diverter System',
    'GV': 'Gate Valve System',
    'HP': 'Production Controls System',
    'LS': 'Liner System',
    'MC': 'Mudline Completion System',
    'MS': 'MS-10/MS-15 Mudline Drilling System',
    'SC': 'Subsea Completion System',
    'SS03': 'SS-10 Subsea Wellhead System',
    'SS0': 'SS-15 Subsea Wellhead System',
    'SS4': 'SS-15 BigBore II Subsea Wellhead System',
    'SS6': 'SS-15 BigBore II-H Subsea Wellhead System',
    'SSH': 'SS-10 Subsea Wellhead System',
    'SW': 'Conventional Wellhead System',
    'WO': 'Workover Completion'
}

if (!ExternalObject.AdobeXMPScript)
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
LINKS = {};
STYLE_SHEET = File.openDialog('Select the InDesign style sheet');

var fileList = File.openDialog('Select the file listing the paths to process:');
fileList.open();
var ends = fileList.lineFeed == 'Windows' ? '\r\n' : '\n',
    filePaths = fileList.read(),
    doc;
fileList.close();

var linkFile = File.openDialog('Select the file listing the mapped links:');
linkFile.open();
var linkPaths = linkFile.read().split(ends);
linkFile.close();
for (var l = 0; l < linkPaths.length; l++) {
    var link = linkPaths[l].split('\t');
    LINKS[link[0]] = link[1];
}

main(filePaths.split(ends));

function main (paths) {
    for (var p = 0; p < paths.length; p++) {
        var path = paths[p].split('\t')[0],
            ext = paths[p].split('\t')[1],
            f = File(path);
        if (!f.exists)
            continue;
        doc = app.open(f);
        updateStyles();

        doc.save(File(f.path + '/' + name + '.indd'));
        doc.exportFile(ExportFormat.PDF_TYPE, 
                       File(f.path + '/' + name + '.pdf'), false);
        doc.close(SaveOptions.NO);
    }
}

function updateStyles () {
    
}

function relink () {
    
}

function addXMP () {
    var name = /^([^. ]+)(.R(\d+))?/.exec(doc.name.toUpperCase()),
        id = name[1],
        rev = name[3] || 0,
        title = grep({ruleBelow: false})[0].contents.toUpperCase().replace(/ *[\r\n] */g, ' '),
        masterFrames = doc.masterSpreads[0].textFrames.everyItem().getElements(),
        footer, sys, mod, links;
    for (var f = 0; f < masterFrames.length; f++) {
        var frameText = masterFrames[f].contents.toUpperCase();
        if (/^[A-Z]{2,6} ?\d{4}/.test(frameText))
            footer = frameText.replace(/^.+[\r\n]*/, '');
        else if (/^(?!PAGE).*SYSTEM/.test(frameText))
            sys = frameText;
    }
    // consider putting dict of prefixes to systems to handle invalid sys footer
    rev = /\br\d+\b/i.test(doc.name) ? 
    var footer = grep({findWhat: '(?i)\\A[A-Z]{2,6} ?\\d{4}[\\S\\s]*'},
                      undefined, {includeMasterPages: true})[0].contents;
    
    /*
     * try using metadataPreference.setProperty with twd namespace
     * 
     * FILE_INDESIGN (indd file format numeric constant)
     * id, title, writers, revision, system, links, modified
     * 
     */
    var fxmp = new XMPFile(doc.fullName.fsName, XMPConst.FILE_INDESIGN, XMPConst.OPEN_FOR_UPDATE),
        xmp = fxmp.getXMP();
    XMPMeta.registerNamespace('http://dril-quip.com/rp/', 'rp');
    xmp.setProperty('http://dril-quip.com/rp/', 'techwriter', 'Marion Kraus');
    fxmp.putXMP(xmp);
    fxmp.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
    
    if(myXmp){
        var destNamespace = "https://indisnip.wordpress.com/";
        // define new namespace
        XMPMeta.registerNamespace(destNamespace,"IndiSnipXMP");
        // insert nodes
        myXmp.setProperty(destNamespace,"creator","IndiSnip");
        myXmp.setProperty(destNamespace,"e-mail","indisnip@gmail.com");
        myXmp.setProperty(destNamespace,"web_site","https://indisnip.wordpress.com");
        myXmp.setProperty(destNamespace,"Version","1.0b");
        // put XMP into file
        if (xmpFile.canPutXMP(myXmp))
            xmpFile.putXMP(myXmp);
        else
            alert("Error storing XMP");
        // close file
        xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
    }
}

function grep (findPrefs, changePrefs, opts) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findChangeGrepOptions.properties = opts ? opts : {};
    app.findGrepPreferences.properties = findPrefs;
    app.changeGrepPreferences.properties = changePrefs ? changePrefs : {};
    return changePrefs ? doc.changeGrep() : doc.findGrep();
}

function getSystem (rpid) {
    rpid = rpid.toUpperCase();
    var sys = /^[A-Z]+/.exec(rpid)[0];
    if (/^CC|CFS/.test(rpid)) return 'Casing Connector System';
    if (/^CR/.test(rpid)) return 'Completion Riser System';
    if (sys == 'CWS') return 'Conventional Wellhead System';
    if (/^DR/.test(rpid)) return 'Drilling Riser System';
    if (/^DT/.test(rpid)) {
        switch (sys) {
            case 'DTAP': return 'Dril-Thru System';
            case 'DTCC': return 'Dril-Thru Casing Connector System';
            case 'DTDR': return 'Dril-Thru Drilling Riser System';
            case 'DTMC': return 'Dril-Thru Mudline Completion System';
            case 'DTSC': return 'Dril-Thru Subsea Completion System';
            case 'DTSS': return 'Dril-Thru Subsea Wellhead System';
            case 'DTUW': return 'Dril-Thru Unitized Wellhead System';
        }
    }
    if (sys == 'DV') return 'Valve System';
    if (/^FD/.test(rpid)) return 'Fixed Diverter System';
    if (sys == 'GVS') return 'Gate Valve System';
    if (sys == 'HPU') return 'Production Controls System';
    if (sys == 'MC') return 'Mudline Completion System';
    if (sys == 'MS') return 'MS-10/MS-15 Mudline Suspension System';
    if (/^SC/.test(rpid)) return 'Subsea Completion System';
    if (sys == 'SSC') return 'Subsea Controls System';
    if (/^SS/.test(rpid)) return 'SS-10/SS-15 Subsea Wellhead System';
    if (/^UW/.test(rpid)) {
        if (sys == 'UW') return 'Unitized Wellhead System';
        return 'Unitized Wellhead Horizontal Tree System';
    }
    if (sys == 'WOC') return 'Workover Controls System';
    
    systems = {
        'CC': 'Casing Connector System',
        'CFS': 'Casing Connector System',
        'CR': 'Completion Riser System',
        'CRC': 'Completion Riser System',
        'CRJ': 'Completion Riser System',
        'CRM': 'Completion Riser System',
        'CWS': 'Conventional Wellhead System',
        'DR': 'Drilling Riser System',
        'DRC': 'Drilling Riser System',
        'DRM': 'Drilling Riser System',
        'DTAP': 'Dril-Thru System',
        'DTCC': 'Dril-Thru Casing Connector System',
        'DTDR': 'Dril-Thru Drilling Riser System',
        'DTMC': 'Dril-Thru Mudline Completion System',
        'DTSC': 'Dril-Thru Subsea Completion System',
        'DTSS': 'Dril-Thru Subsea Wellhead System',
        'DTUW': 'Dril-Thru Unitized Wellhead System',
        'DV': 'Valve System',
        'FD': 'Fixed Diverter System',
        'FDC': 'Fixed Diverter System',
        'FDM': 'Fixed Diverter System',
        'GVS': 'Gate Valve System',
        'HPU': 'Production Controls System',
        'MC': 'Mudline Completion System',
        'MS': 'MS-10/MS-15 Mudline Suspension System',
        'SC': 'Subsea Completion System',
        'SCC': 'Subsea Completion System',
        'SCJ': 'Subsea Completion System',
        'SS': 'Subsea Wellhead System',
        'SSC': 'Subsea Controls System',
        'SSH': 'SS-15 BigBore II-H System',
        'SSJ': 'Subsea Wellhead System',
        'UW': 'Unitized Wellhead System',
        'UWHTS': 'Unitized Wellhead Horizontal Tree System',
        'UWHTSM': 'Unitized Wellhead Horizontal Tree System',
        'WOC': 'Workover Controls System'
    }
    return systems[sys];
}

/*
    var sys = /^[A-Z]+/.exec(rpid)[0],
        num = rpid.substr(sys.length);
    if (systems.hasOwnProperty(rpid.slice(0, 2)))
        return systems[rpid.slice(0, 2)];

ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
myFile = File.openDialog('Select resource file', 'InDesign:*.indd', false);
var doc = app.open(myFile),
    fxmp = new XMPFile(myFile.fsName, XMPConst.FILE_INDESIGN, XMPConst.OPEN_FOR_UPDATE),
    xmp = fxmp.getXMP();
XMPMeta.registerNamespace('http://dril-quip.com/rp/', 'rp');
xmp.setProperty('http://dril-quip.com/rp/', 'techwriter', 'Marion Kraus');
fxmp.putXMP(xmp);
fxmp.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
doc.save();
 */
