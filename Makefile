BROWSERIFY = nodejs node_modules/browserify/bin/cmd.js

all: README.md earlgrey-bundle.js earldoc-lib-bundle.js earldoc-lib.md

README.md: earlgrey.js earldoc.js
	nodejs earldoc.js < earlgrey.js > $@
	nodejs earldoc.js < earldoc.js >> $@

earlgrey-bundle.js: earlgrey.js
	browserify -r ./earlgrey.js -o $@

earldoc-lib-bundle.js: lib/earlgrey/earlgrey.js earldoc-lib.js
	$(BROWSERIFY) -r ./lib/earlgrey/earlgrey.js -r ./earldoc-lib.js -o $@

earldoc-lib.md: earldoc-lib.js
	earldoc < earldoc-lib.js > $@

