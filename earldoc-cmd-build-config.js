({
    baseUrl: ".",
    paths: {
        "earldoc-lib": "earldoc-lib",
        "earldoc-cmd": "earldoc-cmd"
    },
    include: ["earldoc-cmd"],
    out: "script/earldoc.js",
    name: "lib/almond/almond",
    insertRequire: ["earldoc-cmd"],
    optimize: "none"
})

/*global require */
