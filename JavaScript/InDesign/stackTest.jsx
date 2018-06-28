Function.prototype.call = function (thisObject, args) {
    funcName = this.name;
    if (/main|process/.test(funcName))
        $.writeln(funcName);
    this.apply(thisObject, args);
};

main();

function main () {
    var a = 'abcdef'.split('');
    process(a);
}

function process (arg) {
    try {
        subprocess.call(this, arg);
    } catch (e) {
        $.writeln($.stack);
    }
}

function subprocess (arr) {
    for (var a = 0; a < arr.length; a++) {
        if (arr[a] == 'd')
            throw new Error();
        else
            $.writeln(arr[a]);
    }
}