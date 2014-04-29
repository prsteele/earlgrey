all: earldoc-lib-bundle.js earldoc-lib.md

earldoc-lib-bundle.js: lib/earlgrey/earlgrey.js earldoc-lib.js
	browserify -r ./lib/earlgrey/earlgrey.js -r ./earldoc-lib.js -o $@

earldoc-lib.md: earldoc-lib.js
	nodejs earldoc.js < earldoc-lib.js > $@
