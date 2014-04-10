all: earldoc-lib.min.js script/earldoc.js earldoc-lib.md

earldoc-lib.md: earldoc-lib.js script/earldoc.js
	nodejs script/earldoc.js < earldoc-lib.js > $@

earldoc-lib.min.js: earldoc-lib-build-config.js \
                    earldoc-lib-build.js \
                     earldoc-lib.js
	nodejs lib/r/r.js -o $<

script/earldoc.js: earldoc-cmd-build-config.js \
                   earldoc-cmd-build.js \
                   earldoc-cmd.js \
                   earldoc-lib.js
	nodejs lib/r/r.js -o $<
