/**
 * # `earldoc`
 *
 * A command line script for calling into EarlDoc.
 *
 */

define(["earldoc-lib"], function (earldoc) {
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
});

/* Keep JSLint happy */
/*global Packages load define process */
