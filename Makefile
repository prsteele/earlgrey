all: earlgrey.min.js earlgrey.min.norequire.js README.md

earlgrey.min.js: earlgrey-build-config.js earlgrey-build.js earlgrey.js
	nodejs lib/r/dist/r.js -o $<

earlgrey.min.norequire.js: earlgrey-build-norequire-config.js earlgrey.min.js start.frag end.frag
	nodejs lib/r/dist/r.js -o $<

README.md: earlgrey.js
	nodejs lib/earldoc/script/earldoc.js < earlgrey.js > $@
