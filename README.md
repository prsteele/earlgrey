# EarlDoc

EarlDoc is a documentation extraction system for Javascript, or any
language that uses `/* ... */` style multi-line comments. Given a
source file, EarlDoc extracts all comments of the form `/**
... */`, removing any leading `*` forming a banner in the
comment. That's it -- this tool doesn't apply any transformations to
the extracted comments beyond stripping `*` banners.

## Example

Given Javascript source code

    /**
     * Greet a user.
     *
     * @param {String} name The name of the user.
     */
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
     */

    /**
     * Greet a user.
     *
     * @param {String} name The name of the user.
     */
    var say_hello = function (name) {
        return "Hello, " + name + "!";
    }

would produce

    This file defines the function `say_hello`.

    Greet a user.
    
    @param {String} name The name of the user.
