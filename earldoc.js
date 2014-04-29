/**
 * # `earldoc`
 *
 * A command line script for calling into EarlDoc.
 *
 */
var earldoc = require("./earldoc-lib.js");

process.stdin.setEncoding('utf8');

var input = [];

process.stdin.on('readable', function () {
    var chunk = process.stdin.read();

    if (chunk != null) {
        input.push(chunk);
    }
});

process.stdin.on('end', function() {
    var text = input.join('');
    var result = earldoc.parse(text);

    process.stdout.write(result);
});

/* Keep JSLint happy */
/*global Packages load require process */
