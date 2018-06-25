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
 * 
 * ALSO WRITE A COMPANION METADATA SCRIPT THAT AUTOMATICALLY UPDATES XMP DATA ON SAVE
 * AND PLACE IT INTO STARTUP SCRIPTS
 * 
 */

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

var doc, PSTYLES, CSTYLES, TSTYLES, LINKS = {},
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
    };

loadStyles();

if (!ExternalObject.AdobeXMPScript)
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');

String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ {2,}/g, ' ');
};

var fileList = File.openDialog('Select the file listing the paths to process:');
fileList.open();
var ends = fileList.lineFeed == 'Windows' ? '\r\n' : '\n',
    filePaths = fileList.read(),
    ;
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
        // TEST XMPUTILS.SEPARATEARRAYITEMS WITH LINKS, BUT TRY NOT QUOTING, OR NOT ESCAPING QUOTES
        // RETHINK HOW THIS FLOWS, BECAUSE DOC HAS TO CLOSE BEFORE ADDXMP IS CALLED
        /*
         * MOST METADATA IS ACCESSIBLE IN SCRIPT'S OTHER FUNCTIONS (EG NAME IN MAIN, LINKS IN RELINK), SO
         * USE THOSE FUNCTIONS TO SIPHON OUT METADATA TO A GLOBAL VARIABLE, AND THEN PROCESS XMP AT END
         */
        doc.save(File(f.path + '/' + name + '.indd'));
        doc.exportFile(ExportFormat.PDF_TYPE, 
                       File(f.path + '/' + name + '.pdf'), false);
    }
}

function updateStyles () {
    
}

function relink () {
    
}

function addXMP () {
    var docPath = doc.fullName.fsName,
        name = /^([^. ]+)(.R(\d+))?/.exec(doc.name.toUpperCase()),
        title = grep({ruleBelow: false})[0].contents.trim().toUpperCase(),
        desig = getDesignator(),
        system = getSystem().trim().toUpperCase(),
        foot = getFooter(),
        links = getLinks(),
        ns = 'http://dril-quip.com/rp/',
        fxmp, xmp;
    doc.close(SaveOptions.YES);
    fxmp = new XMPFile(doc.fullName.fsName, XMPConst.FILE_INDESIGN, XMPConst.OPEN_FOR_UPDATE);
    xmp = fxmp.getXMP();
    XMPMeta.registerNamespace(ns, 'rp');
    xmp.setProperty(ns, 'id', name[1]);
    xmp.setProperty(ns, 'revision', name[3] || 0);
    xmp.setProperty(ns, 'title', title);
    xmp.setProperty(ns, 'system', system);
    if (foot.mod)
        xmp.setProperty(ns, 'modified', foot.mod);
    if (foot.writers)
        XMPUtils.separateArrayItems(xmp, ns, 'writers', XMPConst.SEPARATE_ALLOW_COMMAS, foot.writers.join('\t'));
    if (links.length)
        XMPUtils.separateArrayItems(xmp, ns, 'links', XMPConst.SEPARATE_ALLOW_COMMAS, links.join('\t'));
    fxmp.putXMP(xmp);
    fxmp.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
}

function getDesignator () {
    var items = doc.pages[0].allPageItems;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item instanceof TextFrame && /designator/i.test(item.parentStory.appliedParagraphStyle.name))
            return item.contents.trim().toUpperCase();
    }
    return null;
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
        var text = footers[f].contents.trim().toUpperCase();
        if (/PAGE/.test(text))
            continue;
        text = /^.*([-0-9/]{5,}).*/m.exec(text);
        if (text) {
            var mod = text[1].replace(/(\d\d)(?=\d\d$)/, '/$1/');
            if (mod.substr(-1) == '/')
                mod = mod.slice(0, -1);
            text = text[0].replace(/\bed\b/g, '');
            writers = text.match(/\b[A-Z]{2,3}\b/g).sort();
        }
    }
    return {'mod': mod || null, 'writers': writers || null};
}

function getLinks () {
    // PROBLEM: LINK PATHS ARE PLATFORM-DEPENDENT (DOTS ON PC, ASTERISKS/SLASHES/COLONS/QUOTES ON MAC)
    var links = doc.links.everyItem().filePath.sort();
    for (var i = links.length - 1; i > -1; i--) {
        if (links[i - 1] !== links[i]) {
            links[i] = decodeURI(File(
                links[i].replace(/^\W*[a-z]+\W*/i, '').replace('\\', '/')
            ));
        else
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

function loadStyles () {
    var styleSheet = File.openDialog('Select the InDesign style sheet', '*.indd');
    if (!styleSheet) return;
    doc = app.open(styleSheet, false);
    
}
