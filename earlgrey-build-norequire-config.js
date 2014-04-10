({
    baseUrl: ".",
    paths: {
        "earlgrey": "earlgrey"
    },
    include: ["earlgrey"],
    name: "lib/almond/almond",
    wrap: {
        startFile: "start.frag",
        endFile: "end.frag"
    },
    out: "earlgrey.min.norequire.js",
    optimize: "none",
    insertRequire: ["earlgrey"]
})
