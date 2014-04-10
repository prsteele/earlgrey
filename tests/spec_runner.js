(function () {
    require.config({
        baseUrl: "..",
        paths: {
            "jasmine": "lib/jasmine/lib/jasmine-core/jasmine",
            "jasmine-html": "lib/jasmine/lib/jasmine-core/jasmine-html",
            "boot": "lib/jasmine/lib/jasmine-core/boot",
            "earlgrey": "earlgrey.min",
            "earlgrey_spec": "tests/earlgrey_spec"
        },
        shim: {
            "jasmine": {
                exports: "window.jasmineRequire"
            },
            "jasmine-html": {
                deps: ["jasmine"],
                exports: "window.jasmineRequire"
            },
            "boot": {
                deps: ["jasmine", "jasmine-html"],
                exports: "window.jasmineRequire"
            }
        }
    });

    var specs = ["tests/earlgrey_spec"];

    require(["boot"], function () {
        require(specs, function () {
            window.onload();
        });
    });
})();

/*global require */
