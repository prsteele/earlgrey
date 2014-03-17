/**
 * # `earldoc`
 *
 * A command line script for calling into EarlDoc.
 *
 */

load("../EarlGrey/parser.js");
load("earldoc-lib.js");

var stdout = Packages.java.lang.System.out;
var stdin = Packages.java.lang.System.in;
var buff = new java.io.BufferedReader(
    new java.io.InputStreamReader(stdin));

var lines = [];
var line = buff.readLine();
while (line != null) {
    lines.push(line);
    line = buff.readLine();
}

var result = earldoc.parse(lines.join("\n"));

stdout.println(result);

/* Keep JSLint happy */
/*global Packages load earldoc */
