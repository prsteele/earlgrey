require.config({
    baseUrl: ".",
    paths: {
        "earlgrey": "lib/earlgrey/earlgrey",
        "earldoc-lib": "earldoc-lib"
    },
    out: "earldoc-lib.min.js",
    name: "build-earldoc-lib"
});

require(["earldoc-lib"], function (lib, cmd) {});
