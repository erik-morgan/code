#target indesign
// #targetengine "session"

(function (global) {
    Folder.current = File($.fileName).parent;
    
    var decode = global.decodeURI;

    #include 'helpers.jsx';
    
    function newDoc (file) {
        if (!file.exists) {
            Batch.log('dne', file);
        }
        var name = decode(file.name.toUpperCase());
        return {
            file: file;
            prefix: /[A-Z]+/.exec(name)[0];
            id: name.match(/^\S+?(?=[. ])/)[0];
            rev: /\bR\d{1,2}\b/.test(name) ? 
                 name.match(/\bR(\d{1,2})\b/)[0] : 0;
        }
    }
    
    function Batch () {
        if (!(this instanceof Batch)) {
            return new Batch();
        }
        this.processes = [];
        this.queue = [];
    }
    
    Batch.prototype.process = function (doc) {
        // still have to add ui & indesign events
        if (this.queue.length == 0) {
            except('queue');
        } else if (this.processes.length == 0) {
            except('process');
        }
    };
    
    global.Batch = Batch();
})($.global);
