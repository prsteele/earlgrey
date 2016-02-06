BROWSERIFY = nodejs node_modules/browserify/bin/cmd.js

all: README.md earlgrey-bundle.js earldoc-lib-bundle.js earldoc-lib.md

README.md: earlgrey.js bin/earldoc.js
	nodejs bin/earldoc.js < earlgrey.js > $@
	nodejs bin/earldoc.js < bin/earldoc.js >> $@

earlgrey-bundle.js: earlgrey.js
	$(BROWSERIFY) -r ./earlgrey.js -o $@

earldoc-lib-bundle.js: earlgrey.js earldoc-lib.js
	$(BROWSERIFY) -r ./earlgrey.js -r ./earldoc-lib.js -o $@

earldoc-lib.md: earldoc-lib.js
	nodejs bin/earldoc.js < earldoc-lib.js > $@

