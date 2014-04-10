require.config({
    baseUrl: ".",
    paths: {
        "earlgrey": "lib/earlgrey/earlgrey",
        "earldoc-cmd": "earldoc-cmd.js",
        "earldoc-lib": "earldoc-lib"
    }
});

require(["earldoc-cmd"], function (earldoc) {});
