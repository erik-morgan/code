#target indesign
// #targetengine "session"

(function (global) {
    Folder.current = File($.fileName).parent;
    
    var hasOwn = Object.prototype.hasOwnProperty,
        decode = global.decodeURI;
    
    // load deps in here, so they're guaranteed to exist when processing
    // evalFile may be totally unnecessary if the following line works
    #include 'helpers.jsx';
    // if this works, put hasOwn, decode, and except into helpers
    
    function evalFile (f) {
        if (!(f = File(f)).exists)
            except('nodep', f, 'evalFile');
        f.open() && eval(f.read());
        f.close();
    }
    
    function except (type, arg, func) {
        var e = type instanceof Error ? type : 
                new Error(
                    type == 'nodep' ? 'Missing required dependency: ' + arg :
                    type == 'process' ? 'No processes in Batch.processes' :
                    type == 'queue' ? 'No documents in Batch.queue' : arg
                );
        if (func) {
            e.from = func instanceof Function ? func.name : func;
        } else if (type == 'process' || type == 'queue') {
            e.from = 'Batch.process';
        }
        if (Batch && Batch.logging) {
            Batch.log(e);
        }
        throw e;
    }
    
    function doc (file) {
        if (!file.exists) {
            Batch.log('error.file', file);
        }
        var name = decode(file.name.toUpperCase());
        this.file = file;
        this.prefix = /[A-Z]+/.exec(name)[0];
        this.id = name.match(/^\S+?(?=\.)/)[0];
        this.rev = /\bR\d{1,2}\b/.test(name) ? 
                   name.match(/\bR(\d{1,2})\b/)[0] : 0;
    }
    
    function Batch () {
        if (!(this instanceof Batch)) {
            return new Batch();
        }
        this.processes = [];
        this.queue = [];
        this.logging = true;
    }
    
    Batch.prototype.process = function () {
        // still have to add ui & indesign events
        (this.processes.length || except('process')) && (this.queue.length || except('queue'));
        if (this.queue.length == 0) {
            except('queue');
        }
        if (this.processes.length == 0) {
            except('process');
        }
    };
    
    Batch.prototype.log = function (scope, data) {
        
    };
    
    global.Batch = Batch();
})($.global);
