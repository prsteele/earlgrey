all: earlgrey-bundle.js README.md

earlgrey-bundle.js: earlgrey.js
	browserify -r ./earlgrey.js -o $@

README.md: earlgrey.js
	earldoc < $< > $@
