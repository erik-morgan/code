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
 * USE METADATA INSTEAD OF LOGGING, THEN EXTRACT & USE METADATA IN SEPARATE SCRIPTS
 */

LINKS = {};
STYLE_SHEET = File.openDialog('Select the InDesign style sheet');
SYSTEMS = {
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

if (!ExternalObject.AdobeXMPScript)
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');

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
    /*
     * id, title, writers, revision, system, links, modified
     */
    var fxmp = new XMPFile(doc.fullName.fsName, XMPConst.FILE_INDESIGN, XMPConst.OPEN_FOR_UPDATE),
        xmp = fxmp.getXMP(),
        ns = 'http://dril-quip.com/rp/',
        name, title, sys, footer, mod, writers, links;
    XMPMeta.registerNamespace(ns, 'rp');
    name = /^([^. ]+)(.R(\d+))?/.exec(doc.name.toUpperCase());
    // getSystem().toUpperCase()
    // var footer = getFooter(); footer.mod/footer.writers
    xmp.setProperty(ns, 'id', name[1]);
    xmp.setProperty(ns, 'revision', name[3] || 0);
    xmp.setProperty(ns, 'title', );
    xmp.setProperty(ns, 'system', sys);
    fxmp.putXMP(xmp);
    fxmp.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
}

function getTitle () {
    var title = grep({ruleBelow: false})[0].contents.toUpperCase();
    return title.replace(/\s+/g, ' ').slice(0, -1);
}

function getSystem () {
    sys = grep({findWhat: '(?im)^.+system', pointSize: '6pt'},
               undefined,
               {includeMasterPages: true});
    return sys.length ? sys[0].contents : SYSTEMS[prefix];
}

function getFooter () {
    var footers = doc.masterSpreads[0].pages[0].textFrames.everyItem().contents;
    for (var f = 0; f < footers.length; f++) {
        var text = footers[f].contents.toUpperCase();
        if (/PAGE/.test(text))
            continue;
        text = /^.*([-0-9/]{5,}).*/m.exec(text);
        if (text) {
            var mod = text[1];
            if (mod.substr(-1) == '/')
                mod = mod.slice(0, -1);
            text = text[0].replace(/\bed\b/g, '');
            writers = text.match(/\b[A-Z]{2,3}\b/g);
        }
    }
    return {mod: mod, writers: writers};
}

function getLinks () {
    // PROBLEM: LINK PATHS ARE PLATFORM-DEPENDENT (DOTS ON PC, ASTERISKS/SLASHES/COLONS/QUOTES ON MAC)
    var links = doc.links.everyItem().filePath.sort();
    for (var i = links.length - 1; i > -1; i--) {
        if (links[i - 1] == links[i])
            links.splice(i, 1);
    }
    return links;
}

function grep (findPrefs, changePrefs, opts) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findChangeGrepOptions.properties = opts ? opts : {};
    app.findGrepPreferences.properties = findPrefs;
    app.changeGrepPreferences.properties = changePrefs ? changePrefs : {};
    return changePrefs ? doc.changeGrep() : doc.findGrep();
}
