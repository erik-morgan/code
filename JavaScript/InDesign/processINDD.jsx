#target indesign

/*
 * THIS SCRIPT WILL PROCESS ALL INDD FILES & COULD THEORETICALLY BE USED WITH BATCH PROCESSING SCRIPT
 * 
 * STANDARDIZE STYLE SHEETS (INCLUDES CLEANING UP MANUALLY ENTERED NUMBERED LIST)
 * RELINK ARTWORK THAT WAS RENAMED
 * ADD DOCUMENT TITLE, AUTHOR, REVISION, SYSTEM, & MAYBE LINK NAMES AS METADATA
 * RE-EXPORT PDF
 * EXTRACT FOOTER INFO, TITLE, SYSTEM, LINK NAMES
 * 
 * USE METADATA INSTEAD OF LOGGING, THEN EXTRACT & USE METADATA IN SEPARATE SCRIPTS
 * ALSO WRITE A COMPANION METADATA SCRIPT THAT AUTOMATICALLY UPDATES XMP DATA ON SAVE
 * AND PLACE IT INTO STARTUP SCRIPTS
 * 
 * 
 */

STYLE_SHEET = app.scriptPreferences.scriptsFolder.getFiles('TWD Stylesheet.indd')[0];
FILE_LIST = File('/path/to/text file/listing paths of procedures/to process.txt');
NETWORK_PREFIX = File.fs == 'Macintosh' ? '/Volumes/' : '/n/';
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
DATA = {
    id: '',
    revision: '',
    title: '',
    desig: '',
    system: '',
    modified: '',
    writers: [],
    links: []
};
var doc;

String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ {2,}/g, ' ');
};

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

// THIS HAS TO BE CONDENSED. MAYBE USE CONSTANT NOTATION...? (EG PUTTING DECLARATIONS AT TOP),
// BUT STILL PUT A CHECK AFTER, TO ENSURE THEYRE PROVIDED
if (initProcess())
    main();

function main () {
    var paths = parseFile(FILE_LIST);
    for (var p = 0; p < paths.length; p++) {
        var f = File(paths[p]);
        if (f.exists) {
            var path = f.path + '/' + getName(f.name.toUpperCase());
            doc = app.open(f);
            updateStyles();
            updateLinks();
            getData();
        doc.save(File(f.path + '/' + name + '.indd'));
        doc.exportFile(ExportFormat.PDF_TYPE, 
                       File(f.path + '/' + name + '.pdf'), false);
            addXMP();
    }
}

function updateStyles () {
    doc.importStyles(ImportFormat.TOC_STYLES_FORMAT, STYLE_SHEET);
    // if twd agrees to table styles, uncomment the following line
    // doc.importStyles(ImportFormat.TABLE_AND_CELL_STYLES_FORMAT, STYLE_SHEET);
    if (doc.paragraphStyles.item('TOC Level 1').isValid)
        doc.paragraphStyles.item('TOC Level 1').remove();
}

function updateLinks () {
    var links = doc.links.everyItem().getElements().sort(function (a, b) {
            return a.filePath == b.filePath ? 0 : (a.filePath > b.filePath ? 1 : -1);
        }),
        linkPaths = [];
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        link.update();
        if (link.status == LinkStatus.LINK_MISSING)
            refactorLink(link);
        if (link.filePath !== linkPaths[linkPaths.length - 1])
            linkPaths.push(link.filePath);
    }
    DATA.links = linkPaths;
}

function refactorLink (link) {
    // relink can take a string
    // invalidChars & leading/trailing spaces = ['<', '>', ':', '"', '/', '\\', '|', '?', '*', 'NUL', 'TAB', 'CR', 'LF'];
    // first, replace all unicode dots, and then process the chars
    // /, :, ", * are all dots
    // 
    var name = link.name,
        path = link.filePath,
        sep = path[path.length - name.length - 1],
        parts = path.replace(/^.*(?=share)/i, NETWORK_PREFIX).split(sep);
    
}

function getData () {
    // at this point, DATA has id, revision, & links
    // need title, desig, sys, mod & writers
    
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

function grep (findPrefs, changePrefs, opts) {
    app.findChangeGrepOptions = app.findGrepPreferences = app.changeGrepPreferences = null;
    app.findChangeGrepOptions.properties = opts ? opts : {};
    app.findGrepPreferences.properties = findPrefs;
    app.changeGrepPreferences.properties = changePrefs ? changePrefs : {};
    return changePrefs ? doc.changeGrep() : doc.findGrep();
}

function getName (name) {
    return name.replace(/^([^. ]+).(R(\d+))?.*/, function (m, g1, g2, g3) {
        var id = g1.replace(/[^A-Z0-9]+/g, '').replace(/(\d\d)/g, '-$1');
        id = id.replace(/([A-Z]+)-(\d\d)(-(\d\d))?/g, '$1$2$4');
        DATA.id = id;
        DATA.revision = g3 || 0;
        return [id, g2 ? g2 : ''].join('.') + '.indd';
    });
}

function initProcess () {
    if (!STYLE_SHEET.exists || !FILE_LIST.exists)
        return false;
    if (!ExternalObject.AdobeXMPScript)
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    return true;
}

function parseFile (f) {
    if (f.exists) {
        f.open();
        var lines = f.read().split(f.lineFeed == 'Windows' ? '\r\n' : '\n');
        f.close();
        return lines;
    }
}
