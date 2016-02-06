# EarlDoc

A command line script for calling into `earldoc-lib.js`.

EarlDoc is a documentation extraction system for Javascript, or any
language that uses slash-star, star-slash multi-line
comments. Given a source file, EarlDoc extracts all comments of the
form `/** ... *_/` (with the underscore removed), removing any
leading `*` forming a banner in the comment. That's it -- this tool
doesn't apply any transformations to the extracted comments beyond
stripping `*` banners.

*Note* Throughout we use the convention of `*_/` as the ending
multi-line comment delimiter to avoid terminating Javascript
comments prematurely. You should _not_ do this in your own code, as
it is not legal Javascript.

## Usage

    node earldoc.js < INFILE > OUTFILE
    
## Building

You can build the library with ``make``. However, you'll need to
install ``browserify`` via NodeJS (or otherwise). Modify the
``Makefile`` if you install ``browserify`` non-locally. Note that the
existing macro definition in the ``Makefile`` assumes ``browserify``
was installed via ``npm install browserify`` being run in this
directory.

## Example

Given Javascript source code

    /**
     * Greet a user.
     *
     * @param {String} name The name of the user.
     *_/
    var say_hello = function (name) {
        return "Hello, " + name + "!";
    }
    
EarlDoc would then produce

    Greet a user.
    
    @param {String} name The name of the user.
    
It is up to you do something with the `@param` directive; I suggest
using Markdown in your comments.

The previous example was a bit misleading -- there is no need for a
comment to precede a function. The code

    /**
     * This file defines the function `say_hello`.
     *_/

    /**
     * Greet a user.
     *
     * @param {String} name The name of the user.
     *_/
    var say_hello = function (name) {
        return "Hello, " + name + "!";
    }

would produce

    This file defines the function `say_hello`.

    Greet a user.
    
    @param {String} name The name of the user.
 
