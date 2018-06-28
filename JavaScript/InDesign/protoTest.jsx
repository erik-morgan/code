links = [
    'share:SERVICE:TWD:DQ Logo.ai',
    'share:SERVICE:TWD:DQ Logo.ai',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:Adapter.eps',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:BOP Isolation Slv.eps',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-502912.B Neck Seal Tool.eps',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-503495 Body Seal.ai',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-502912.B_Neck Seal Tool - Uninstall.eps',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-503495 Body Seal.ai',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-PD-59993-75 Remove Upper Lock Nut.eps',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-PD-59993-24 Comm Adapter and Iso Slv Installed in Tbg Hgr 1.eps',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-502491 Test Combination Tool BP Mode.ai',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-PD-59993-24 Comm Adapter Installed in Tbg Hgr 1.eps',
    'share:SERVICE:TWD:Chevron Big Foot Service Manual 2018:1-10K Production Phase:18 UW0180-08-06 Testing the BOP When Performing a Workover:2-L-30709-09 Combo Tool Adapter Installed.eps'
];

Array.prototype.forEach = function(callback) {
    if (this == null)
      throw new TypeError('this is null or not defined');
    if (typeof callback !== 'function')
      throw new TypeError(callback.name + ' is not a function');
    for (var i = 0, len = this.length; i < len; i++) {
        callback.call(undefined, this[i], i);
    }
};


var Procedure = function () {
    this.name = 'Some Procedure ID';
};

Procedure.prototype.cleanPath = function (path) {
    return path.replace(':', '/');
};
        
Procedure.prototype.updateLinks = function () {
    for (var l = links.length - 1; l > -1; l--) {
        var link = this.cleanPath(links[l]);
        if (contains(links, link))
            links.splice(l, 1);
        else
            links[l] = link;
    }
    this.links = links;
};

function contains (arr, val) {
    for (var a = 0; a < arr.length; a++) {
        if (arr[a] == val)
            return true;
    }
    return false;
}

var proc = new Procedure();
proc.updateLinks();
$.writeln(proc.links.join('\n'));