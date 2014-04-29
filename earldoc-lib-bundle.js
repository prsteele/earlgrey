require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"gazCOv":[function(require,module,exports){
/**
 * # EarlDoc
 *
 * EarlDoc is a Javascript documentation extraction system; it outputs
 * the plain text contents of all Javascript comments beginning with
 * `/**`, ignoring all code, inline comments, and other multiline
 * comments. You should use your favorite markup (or down!) system to
 * turn the comments into formatted documents.
 *
 * [TOC]
 *
 * ## Implementation notes
 *
 * This library was written using the EarlGrey parser; in fact, this
 * project was conceived as a way to both document and test EarlGrey.
 *
 * The documentation for this project is, of course, generated using
 * EarlDoc. Specifically, all `/**`-style comments in the source code
 * contain valid Markdown code that is extracted using EarlDoc.
 *
 * The same conventions are used for documenting types as in the
 * EarlGrey documentation; in particular, we employ type annotations
 * inspired by Haskell.
 *
 * # API
 *
 * ## `earldoc`
 *
 * The top-level object exported by the library.
 *
 * ### Type
 *
 *     earldoc :: {String: Function}
 */
var P = require("./lib/earlgrey/earlgrey.js");

/**
 * ## `join`
 *
 * Creates a function that concatentates the contents of an array
 * together, with each element separated by `s`.
 *
 * ### Type
 *
 *     join :: String -> ([String] -> String)
 */
var join = function (s) {
    return function (arr) {
        return arr.join(s);
    };
};

/**
 * ## `s`
 *
 * A function used to make a parser return a string, rather than
 * an array of strings. `s(p)` is a shortcut for `P.fmap(join(""),
 * p)`.
 *
 * ### Type
 *
 *     s :: Parser [String] -> Parser String
 */
var s = P.lift(join(""));

/**
 * ## `single_quote`
 *
 * Matches a single quote, i.e. `'`.
 *
 * ### Type
 *
 *     single_quote :: Parser String
 */
var single_quote = P.word("'");

/**
 * ## `double_quote`
 *
 * Matches a double quote, i.e. `"`.
 *
 * ### Type
 *
 *     double_quote :: Parser String
 */
var double_quote = P.word("\"");

/**
 * ## `newline`
 *
 * Matches a newline character.
 *
 * ### Type
 *
 *     newline :: Parser String
 */
var newline = P.word("\n");

/**
 * ## `escaped_single_quote`
 *
 * Matches a an escaped single quote, i.e. `\'`.
 *
 * ### Type
 *
 *     escaped_double_quote :: Parser String
 */
var escaped_single_quote = P.word("\\'");

/**
 * ## `escaped_double_quote`
 *
 * Matches a an escaped double quote, i.e. `\"`.
 *
 * ### Type
 *
 *     escaped_double_quote :: Parser String
 */
var escaped_double_quote = P.word("\\\"");

/**
 * ## `star`
 *
 * Matches an asterisk.
 *
 * ### Type
 *
 *     star :: Parser String
 */
var star = P.word("*");

/**
 * ## `slash`
 *
 * Matches a forward slash.
 *
 * ### Type
 *
 *     slash :: Parser String
 */
var slash = P.word("/");

/**
 * ## `star_not_ending_comment`
 *
 * Matches an asterisk that doesn't belong to a comment
 * terminator.
 *
 * ### Type
 *
 *     star_not_ending_comment :: Parser String
 */
var star_not_ending_comment =
        s(P.plus(star, P.skip(P.peek(P.not(slash)))));

/**
 * ## `slash_not_starting_comment`
 *
 * Matches a slash that isn't part of the start of a comment.
 *
 * ### Type
 *
 *     slash_not_starting_comment :: Parser String
 */
var slash_not_starting_comment =
        s(P.plus(slash, P.skip(P.peek(P.not(star)))));

/**
 * ## `start_multiline_comment`
 *
 * Matches the start of a `/*`-style comment.
 *
 * ### Type
 *
 *     start_comment :: Parser String
 */
var start_multiline_comment = s(P.plus(slash, star));

/**
 * ## `end_multiline_comment`
 *
 * Matches the end of a multiline comment.
 *
 * ### Type
 *
 *     end_comment :: Parser String
 */
var end_multiline_comment = s(P.plus(star, slash));

/**
 * ## `start_inline_comment`
 *
 * Matches the start of a `//`-style comment.
 *
 * ### Type
 *
 *     start_comment :: Parser String
 */
var start_inline_comment = s(P.plus(slash, slash));

/**
 * ## `inline_comment`
 *
 * Matches an inline comment.
 *
 * ### Type
 *
 *     inline_comment :: Parser String
 */
var inline_comment = s(P.plus(start_inline_comment,
                              s(P.many(P.not(newline))),
                              P.or(P.skip(P.eof), newline)));

/**
 * ## `start_doc_comment`
 *
 * Matches the start of a `/**`-style comment.
 *
 * ### Type
 *
 *     start_comment :: Parser String
 */
var start_doc_comment = s(P.plus(slash, star, star));

/**
 * ## `start_comment`
 *
 * Matches the start of any Javascript comment.
 *
 * ### Type
 *
 *     start_comment :: Parser String
 */
var start_comment = P.or(start_inline_comment, start_multiline_comment);

/**
 * ## `js_single_quote`
 *
 * Match a quote delimited by single quotes.
 *
 * ### Type
 *
 *     js_single_quote :: Parser String
 */
var js_single_quote = s(P.plus(single_quote,
                               s(P.many(P.or(escaped_single_quote,
                                             P.not(single_quote)))),
                               single_quote));

/**
 * ## `js_double_quote`
 *
 * Match a quote delimited by double quotes.
 *
 * ### Type
 *
 *     js_double_quote :: Parser String
 */
var js_double_quote = s(P.plus(double_quote,
                               s(P.many(P.or(escaped_double_quote,
                                             P.not(double_quote)))),
                               double_quote));

/**
 * ## `not_doc_comment`
 *
 * Matches a body of text that doesn't contain a documentation
 * comment.
 *
 * ### Type
 *
 *     not_doc_comment :: Parser String
 */
var not_doc_comment = 
        s(P.many(P.or(js_single_quote,
                      js_double_quote,
                      inline_comment,
                      P.plus(start_multiline_comment,
                             P.not(P.word("*")),
                             P.many(P.not(end_multiline_comment)),
                             end_multiline_comment),
                      P.not(start_comment))));

/**
 * ## `banner`
 *
 * Matches a comment banner consisting of any amount of
 * whitespace, an asterisk, and optionally one space.
 *
 * ### Type
 *
 *     banner :: Parser [String]
 */
var banner = P.plus(P.many(P.one_of(" \t")),
                    P.plus(star_not_ending_comment,
                           P.option(P.word(" "))));

/**
 * ## `doc_comment_line`
 *
 * Matches a line of documentation comment. Returns only the
 * content after the optional banner.
 *
 * ### Type
 *
 *     doc_comment_line :: Parser String
 */
var doc_comment_line = P.fmap(
    function (arr) {
        return arr[0];
    },
    P.plus(P.option(P.skip(banner)),
           P.or(
               P.fmap(
                   function (arr) {
                       // Join the many match
                       arr[0] = arr[0].join("");

                       // Throw in the newline, if it's there
                       return arr.join("");
                   },
                   P.plus(
                       P.many1(P.not(P.or(newline,
                                          end_multiline_comment))),
                       P.or(newline,
                            P.skip(P.peek(end_multiline_comment))))),
               newline)));

/**
 * ## `doc_comment`
 *
 * Match a comment beginning with `/**`. The comment delimiters
 * are discarded, with only the body of the comment being
 * returned.
 *
 * ### Type
 *
 *     comment :: Parser String
 */
var doc_comment = P.fmap(
    function (arr) {
        return arr[0];
    },
    P.plus(P.skip(start_doc_comment),
           s(P.many(doc_comment_line)),
           P.skip(end_multiline_comment)));

/**
 * ## `doc_comments`
 *
 * Match many documentation comments, possibly separated by text
 * that isn't in a documentation comment. Returns an array of the
 * bodies of comments.
 *
 * ### Type
 *
 *     doc_comments :: Parser [String]
 */
var doc_comments = P.fmap(
    function (arr) {
        if (arr.length == 1) {
            return arr[0];
        }
        return [];
    },
    P.plus(P.skip(P.option(not_doc_comment)),
           P.option(P.separated_by(doc_comment,
                                   P.skip(not_doc_comment))),
           P.skip(P.option(not_doc_comment))));

var parse = function (text) {
    var result = doc_comments(P.prepare(text));

    if (result.success) {
        return result.result.value.join("\n\n");
    }
    return result;
};

exports.parse = parse;
exports.js_single_quote = js_single_quote;
exports.js_double_quote = js_double_quote;
exports.banner = banner;
exports.doc_comment_line = doc_comment_line;
exports.doc_comment = doc_comment;
exports.not_doc_comment = not_doc_comment;
exports.doc_comments = doc_comments;

/*global require exports */

},{"./lib/earlgrey/earlgrey.js":"XrEFUk"}],"./earldoc-lib.js":[function(require,module,exports){
module.exports=require('gazCOv');
},{}],"XrEFUk":[function(require,module,exports){
/**
 * # EarlGrey
 *
 * EarlGrey defines a small library of parsers and parser combinators
 * for use in top-down, recursive-descent parsing. Although these
 * parsers are language-agnostic, this library was written for parsing
 * Scheme.
 *
 * [TOC]
 *
 * ## Type annotations
 *
 * We use a type annotation system inspired by Haskell's, with the
 * following modifications to accomodate for Javascript's nonpure
 * behavior.
 *
 * *   Javascript supports functions with no arguments. We denote this by
 *     having no type before the arrow. For example,
 *
 *         var f = function () {
 *             return 0;
 *         };
 *
 *     would have type `-> Number`.
 *
 * *   Javascript supports functions with no return type. We denote this
 *     by having no type after the arrow. For example, in
 *
 *         var count = 0;
 *         var add_to = function (x) {
 *             count += x;
 *         };
 *
 *     the function `add_to` would have type `Number ->`.
 *
 * *   These two notations can be combined. For example, in
 *
 *         var count = 0;
 *         var inc = function () {
 *             count += 1;
 *         };
 *
 *     the function `inc` would have type `->`.
 *
 * ## Parsers
 *
 * We define a parser as any function that accepts a `State` and
 * returns a `Result`; that is, a function of type `State ->
 * Result`. We define a small collection of basic parsers and parser
 * generators (of type `a -> State -> Result`). New parsers can be
 * defined with parser combinators (discussed below) or simply by
 * defining any function of the appropriate type.
 *
 * Formally, we define the parser type as
 *     type Parser a = State -> Result (Maybe a)
 *
 * ### Parser combinators
 *
 * A parser combinator is any function that, when given one or more
 * parsers as input, produces a new parser; that is, any function of
 * type `Parser -> Parser`, `(Parser, Parser) -> Parser`, etc. We
 * provide a number of parser combinators that can be used to define a
 * rich set of parsers. Like parsers, a new parser combinators can be
 * defined simply by defining any function of the appropriate type.
 *
 * ### Example
 *
 * First we define several simple parsers to match parenthesis,
 * spaces, and letters in the basic English alphabet.
 *
 *     var space       = P.word(" ");
 *     var left_paren  = P.word("(");
 *     var right_paren = P.word(")");
 *     var alpha       = P.one_of("abcdefghijklmnopqrstuvwxyz" +
 *                                "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
 *
 * We can make new parsers to match entire words or a sequence of
 * words separated by spaces.
 *
 *     var word        = P.many1(alpha);
 *     var sentence    = P.separated_by(word, space);
 *
 * Finally, we can match a parenthetical remark by combining these
 * parsers.
 *
 *     var remark      = P.plus(left_paren,
 *                              sentence,
 *                              right_paren);
 *
 * We could use this parser as follows.
 *
 *     var body = new Body("Example text", "(Hello world)");
 *     var state = new State(body);
 *     var result = remark(state);
 *
 *     // has value true
 *     var x = result.success;
 *
 *     // has value ["(", "Hello", " ", "world", ")"]
 *     var y = result.result;
 *
 */

/**
 * ## Maybe
 *
 * A `Maybe` value represents a value that can either have some
 * value or no value.
 */
var Maybe = function (has_value, value) {
    this.has_value = has_value;
    this.value = value;
};

/**
 * ## Maybe.map
 *
 * Apply a function to the stored value, if any. Optionally pass
 * in the Result context.
 *
 * ### Type
 *
 *     Maybe.map :: (a -> b) -> Maybe a -> Maybe b
 *     Maybe.map :: ((a -> b), Result a) -> Maybe a -> Maybe b
 */
Maybe.prototype.map = function (f, result) {
    if (this.has_value) {
        this.value = f(this.value, result);
    }

    return this;
};

/**
 * ## Just
 *
 * A constructor for `Maybe` values that store a value.
 */
var Just = function (x) {
    this.has_value = true;
    this.value = x;
};
Just.prototype = new Maybe();

/**
 * ## None
 *
 * A `Maybe` that stores no value.
 *
 */
var None = new Maybe(false, null);

/**
 * ## just
 *
 * Constructs a new `Maybe` value that stores the given value.
 *
 * ### Type
 *
 *     just :: a -> Just a
 */
var just = function (x) {
    return new Just(x);
};

/**
 * ## Body
 *
 * A body of text to be parsed.
 */
var Body = function (name, text) {
    this.name = name;
    this.text = text;
    this.len = text.length;

    var lines = this.text.split("\n");

    // Compute the aggregate character counts at the beginning of
    // each line
    this._char_counts = [0];
    for (var i = 0; i < lines.length - 1; i += 1) {
        var line = lines[i];
        var len = this._char_counts[i] + line.length;
        this._char_counts.push(len);
    }
};

/**
 * ## Body.at
 *
 * Returns the character at position `i`, or the empty string if
 * `i` is out-of-bounds.
 *
 * ### Type
 *
 *     Body.at :: int -> String
 */
Body.prototype.at = function (i) {
    if (i < this.len) {
        return this.text[i];
    }
    return "";
};

/**
 * ## Body.line_column
 *
 * Returns the line (1-based) and column (0-based) of a given
 * character index.
 *
 * ### Type
 *
 *     Body.at :: int -> {line: int, column: int}
 */
Body.prototype.line_column = function (i) {
    // Find the greatest line number with a total character count
    // less than or equal to i.
    var L = 0;
    var U = this._char_counts.length - 1;
    while (L < U) {
        var M = Math.floor((L + U) / 2);

        if (this._char_counts[M] <= i) {
            // If L == M, then L + 1 == U and we conclude L is the
            // greatest line with a character count less than or
            // equal to i. Otherwise, increase L.
            if (L == M) {
                U = L;
            } else {
                L = M;
            }
        } else {
            U = M;
        }
    }

    return {line: L + 1, column: i % this._char_counts[L]};
};

/**
 * ## State
 *
 * A `State` represents the position of a parse in a `Body`.
 */
var State = function (body) {
    this.body = body;
    this.pos = 0;
    this.cur = this.body.at(this.pos);
};

/**
 * ## State.toString
 *
 * Returns a `String` representation of this object.
 *
 * ### Type
 *
 *     State.toString :: -> String
 */
State.prototype.toString = function () {
    return this.body.name + ": " + this.pos + " [" + this.cur + "]";
};

/**
 * ## State.copy
 *
 * Returns a shallow copy of the `State`, suitable for creating
 * `State` objects that can be safely modified by child parsers.
 *
 * ### Type
 *
 *     State.copy :: -> State
 */
State.prototype.copy = function () {
    var s = new State(this.body);
    s.pos = this.pos;
    s.cur = this.cur;
    return s;
};

/**
 * ## State.advance
 *
 * Consumes one unit of input in the `State`.
 *
 * ### Type
 *
 *     State.advance :: ->
 */
State.prototype.advance = function () {
    this.pos += 1;
    this.cur = this.body.at(this.pos);
};

/**
 * ## State.advance_by
 *
 *Consume `n` units of input in the `State`.
 *
 * ### Type
 *
 *     State.advance_by :: Number ->
 */
State.prototype.advance_by = function (n) {
    this.pos += n;
    this.cur = this.body.at(this.pos);
};

/**
 * ## Result
 *
 * Instances of this class represent the result of a parse. When a
 * parse is successful, the `Result` stores a `Maybe a` value,
 * where storing `none` indicates that no value was returned, and
 * the `.success` attribute will be `true`. When the parse is
 * unsuccessful, no value (i.e., `null`) is stored and the
 * `.success` attribute will be `false`.
 */
var Result = function (success, result, state, start, end) {
    // Was the parse successful?
    this.success = success;

    // The result of the parse (should be a Maybe)
    this.result = result;

    // The state after the parse
    this.state = state;

    // The position in the body before the parse
    this.start = start;

    // The position in the body after the parse.
    this.end = end;
};

/**
 * ## Result.toString
 *
 * Returns a `String` representation of this object.
 *
 * ### Type
 *
 *     Result.toString :: -> String
 */
Result.prototype.toString = function () {
    if (this.success) {
        return "" + this.result;
    }

    if (this.state.cur == "") {
        return "Failure: unexpected end-of-file";
    }
    
    return ("Failure: error at character " + this.state.pos
            + ": unexpected character '" + this.state.cur + "'");
};

Result.prototype.matched = function () {
    return this.state.body.text.slice(this.start, this.end);
};

/**
 * ## failure
 *
 * Constructs a failed `Result` at the given `State`.
 *
 * ### Type
 *
 *     failure :: State -> Result None
 */
var failure = function (start, state) {
    return new Result(false, None, state, start, state.pos);
};

/**
 * ## success
 *
 * Constructs a successful `Result` with the given value at the
 * given `State`.
 *
 * ### Type
 *
 *     success :: (a, State) -> Result (Just a)
 */
var success = function (result, start, state) {
    return new Result(true, just(result), state, start, state.pos);
};

/**
 * ## one_of
 *
 * A parser generator that produces parsers which match one of any
 * character in a string.
 *
 * ### Example
 *
 *     var lower = one_of("abcdefghijklmnopqrstuvwxyz");
 *
 * ### Type
 *
 *     one_of :: String -> Parser String
 */
var one_of = function (s) {
    var len = s.length;
    return function (state) {
        var start = state.pos;
        var cur = state.cur;
        for (var i = 0; i < len; i++) {
            if (cur == s[i]) {
                state.advance();
                return success(cur, start, state);
            }
        }

        return failure(start, state);
    };
};

/**
 * ## none_of
 *
 * A parser generator that produces parsers which match one of any
 * character not in a String.
 *
 * ### Example
 *
 *     var visible = none_of(" \t\n\r\f");
 *
 * ### Type
 *
 *     none_of :: String -> Parser String
 */
var none_of = function (s) {
    var len = s.length;
    return function (state) {
        var start = state.pos;
        var cur = state.cur;

        // Auto-fail at the end of file, since we must consume one
        // unit of input
        if (cur == "") {
            return failure(start, state);
        }

        for (var i = 0; i < len; i++) {
            if (cur == s[i]) {
                return failure(start, state);
            }
        }

        state.advance();
        return success(cur, start, state);
    };
};

/**
 * ## word
 *
 * A parser generator that produces parsers which match a String
 * exactly.
 *
 * ### Example
 *
 *     var my_name = word("Patrick");
 *
 * ### Type
 *
 *     word :: String -> Parser String
 */
var word = function (s) {
    var len = s.length;
    return function (state) {
        var start = state.pos;
        var a = state.pos;
        var b = a + len;

        if (state.body.text.slice(a, b) === s) {
            state.advance_by(len);
            return success(s, start, state);
        }

        return failure(start, state);
    };
};

/**
 * ## iword
 *
 * A parser generator that produces parsers which match a String,
 * ignoring case.
 *
 * ### Example
 *
 *     var my_name = iword("patrick");
 *
 * ### Type
 *
 *     iword :: String -> Parser String
 */
var iword = function (s) {
    s = s.toLowerCase();
    var len = s.length;
    return function (state) {
        var start = state.pos;
        var a = state.pos;
        var b = a + len;

        if (state.body.text.slice(a, b).toLowerCase() === s) {
            state.advance_by(len);
            return success(s, start, state);
        }

        return failure(start, state);
    };
};

/**
 * ## any
 *
 * A parser that matches any single character. This parser can
 * only fail if there is no input left to consume.
 *
 * ### Type
 *
 *     any :: Parser String
 */
var any = none_of("");

/**
 * ## eof
 *
 * A parser that matches the end of a file (or the end of a body
 * of text). It stores the empty string on success. The state is
 * not advanced, and so this can be matched many times.
 *
 * ### Type
 *
 *     any :: Parser String
 */
var eof = function (state) {
    var start = state.pos;
    if (state.pos == state.body.len) {
        return success("", start, state);
    }

    return failure(start, state);
};

/**
 * ## many
 *
 * A parser combinator that creates parsers which match a parser
 * zero or more times.
 *
 * ### Example
 *
 *     var how_exciting = many(word("!"));
 *
 * ### Type
 *
 *     many :: Parser a -> Parser [a]
 */
var many = function (p) {
    return function (state) {
        var start = state.pos;
        var results = [];

        var halt = false;
        while (halt == false) {
            var s = state.copy();
            var ret = p(s);

            if (ret.success) {
                if (ret.result.has_value) {
                    results.push(ret.result.value);
                }

                state = ret.state;
            } else {
                halt = true;
            }
        }

        return success(results, start, state);
    };
};

/**
 * ## plus
 *
 * A parser combinator that creates a parser which matches a
 * sequence of parsers.
 *
 * ### Example
 *
 *     var _word = many(one_of("abcdefghijklmnopqrstuvwxyz"));
 *     var word_pair = plus(_word, word(" "), _word);
 *
 * ### Type
 *
 *     plus :: (Parser a, Parser b, ...) -> Parser [a, b, ...]
 */
var plus = function () {
    var _args = arguments;
    var _len = _args.length;

    return function (state) {
        var start = state.pos;
        var results = [];

        for (var i = 0; i < _len; i++) {
            var s = state.copy();
            var p = _args[i];
            var ret = p(s);

            if (ret.success == false) {
                return ret;
            }

            if (ret.result.has_value) {
                results.push(ret.result.value);
            }
            state = ret.state;
        }

        return success(results, start, state);
    };
};

/**
 * ## or
 *
 * A parser combinator that creates a parser which matches the
 * first of several alternatives to succeed.
 *
 * ### Example
 *
 *     var a_or_b = or(word("a"), word("b"));
 *
 * ### Type
 *
 *     or :: (Parser a, Parser b, ...) -> Parser a|b|...
 */
var or = function () {
    var _args = arguments;
    var _len = arguments.length;

    return function (state) {
        var start = state.pos;
        var last = null;
        for (var i = 0; i < _len; i++) {
            var s = state.copy();
            var p = _args[i];
            var ret = p(s);

            if (ret.success) {
                return ret;
            } else {
                last = ret;
            }
        }

        // If we didn't match anything, return the last failed result
        return failure(start, state);
    };
};

/**
 * ## and
 *
 * A parser combinator that creates a parser which matches the
 * each of several parsers to succeed. Returns a Parser with the
 * same type as the first argument provided.
 *
 * ### Type
 *
 *     and :: (Parser a, Parser b, ...) -> Parser a
 */
var and = function () {
    var _args = arguments;
    var _len = _args.length;

    if (_len == 0) {
        throw "`and` must receive at least one argument";
    }

    return function (state) {
        var p = _args[0];
        var result = p(state.copy());

        if (result.success == false) {
            return result;
        }

        for (var i = 1; i < _len; i++) {
            var q = _args[i];
            var ret = q(state.copy());

            if (ret.success == false) {
                return ret;
            }
        }

        return result;
    };
};

/**
 * ## many1
 *
 * A parser combinator that creates parsers which match a parser
 * one or more times.
 *
 * ### Example
 *
 *     var how_exciting = many1(word("!"));
 *
 * ### Type
 *
 *     many1 :: Parser a -> Parser [a]
 */
var many1 = function (p) {
    return fmap(
        function (li) {
            if (li.length == 2) {
                return [li[0]].concat(li[1]);
            } else {
                // p is skip. Return the empty list. To see this, note
                // that if the first p doesn't match, then the plus
                // fails and this function won't get called. Thus, the
                // first p matched, and so many(p) returned at least
                // []. If p is a skip, then plus will aggregate only a
                // single value -- [] -- after discarding the result
                // of the first p.
                return [];
            }
        },
        plus(p, many(p)));
};

/**
 * ## skip
 *
 * A parser combinator that creates a parser that matches another
 * parser but throws away the result.
 *
 * ### Example
 *
 *     // This parser will extract a single character from inside
 *     // parentheses
 *     var inside = plus(skip(word("(")), any, skip(word(")")));
 *
 * ### Type
 *
 *     skip :: Parser a -> Parser none
 *
 */
var skip = function (p) {
    return function (state) {
        var start = state.pos;
        var result = p(state);

        if (result.success == false) {
            return result;
        }

        return new Result(true, None, result.state, start, state.pos);
    };
};

/**
 * ## separated_by
 *
 * Creates a parser that matches one or more of one parser with
 * each copy separated by a match of another.
 *
 * ### Example
 *
 * // Matches "!","!?!", "!?!?!", ...
 * var alt = separated_by(word("!"), word("?")); 
 *
 * ### Type
 *
 *     separated_by :: Parser a -> Parser b -> Parser [(a|b)]
 */
var separated_by = function (p, q) {
    var flatten = lift(function (li) {
        var result = [];
        for (var i = 0; i < li.length; i++) {
            result = result.concat(li[i]);
        }
        return result;
    });

    var f = lift(function (li) {
        if (li.length == 2) {
            return [li[0]].concat(li[1]);
        } else {
            // p is skip. Return whatever was in many. To see
            // this, note that if the first p doesn't match, then
            // the plus fails and this function won't get
            // called. Thus, the first p matched, and so
            // many(plus(p, q)) returned at least []. If p is a
            // skip, then plus will aggregate only a single value
            // -- whatever is in the many -- after discarding the
            // result of the first p.
            return li[0];
        }
    });

    return f(plus(p, flatten(many(plus(q, p)))));
};

/**
 * ## option
 *
 * Creates a parser that matches zero or one of a given parser. If
 * the parser matches, a `Just` is stored. If the parser fails to
 * match and a default value is stored, that value is stored as a
 * `Just`. Otherwise, a `None` is stored..
 *
 * ### Example
 *
 *     var optional_sign = plus(option(one_of("+-")),
 *                              many1(one_of("0123456789")));
 *
 * ### Type
 *
 *     option :: Parser a -> Parser a
 *     option :: (Parser a, b) -> Parser (a|b)
 */
var option = function (p, default_value) {
    var fail_value = None;
    if (default_value != undefined) {
        fail_value = new Just(default_value);
    }
    
    return function (state) {
        var start = state.pos;
        var result = p(state.copy());

        if (result.success == false) {
            return new Result(true, fail_value, state, start, state.pos);
        }

        return result;
    };
};

/**
 * ## peek
 *
 * Creates a Parser that consumes no input on success. On failure,
 * state *is* consumed to allow for useful error messages;
 * however, this behavior is the same as all other parsers, and so
 * backtracking will still work.
 *
 * ### Example
 *
 *     var followed_by_x = plus(p, peek(word("x")));
 *
 * ### Note
 *
 * If a `peek`-created parser will succeed once, it will succeed
 * (infinitely) many times; be careful with `many` and `many1`.
 *
 * ### Type
 *
 *     peek :: Parser a -> Parser a
 */
var peek = function (p) {
    return function (state) {
        var result = p(state.copy());

        if (result.success == false) {
            return result;
        }

        result.state = state;
        return result;
    };
};

/**
 * ## not
 *
 * Creates a new parser that fails when the provided parser
 * matches and succeeds otherwise; on success, a single character
 * is consumed.
 *
 * Creates a Parser that consumes no input and only succeeds when
 * the provided parser fails.
 *
 * ### Example 1
 *
 * Match the division operator "/", but not the start of a comment
 * "/*".
 *
 *     plus(word("/"), peek(not("*")));
 *
 * ### Example 2
 *
 * Match content encased by a delimeter described by a parser `p`.
 *
 *     plus(p, many(not(p)), p);
 *
 * ### Type
 *
 *     not :: Parser a -> Parser a
 */
var not = function (p) {
    return function (state) {
        var start = state.pos;
        var result = p(state.copy());
        
        if (result.success) {
            return failure(start, state);
        }

        return any(state);
    };
};

/**
 * ## prepare
 *
 * A convenience function for creating a Body and State for some
 * text.
 *
 * ### Example
 *
 *     var result = many("!")(prepare("!!"));
 *
 * ### Type
 *
 *     prepare :: String -> State
 */
var prepare = function (text) {
    var b = new Body("", text);
    var s = new State(b);
    return s;
};

/**
 * ## `lift`
 *
 * Takes in a function `f :: a -> b` and returns a function `g ::
 * Parser a -> Parser b`.
 *
 * ### Type
 *
 *     lift :: (a -> b) -> (Parser a -> Parser b)
 */
var lift = function (f) {
    return function (p) {
        return function (state) {
            var result = p(state);
            result.result.map(f, result);
            return result;
        };
    };
};

/**
 * ## fmap
 *
 * Given a function and a parser, lift the function, apply it to
 * the parser, and return the result.
 *
 * ### Type
 *
 *     fmap :: (a -> b) -> Parser a -> Parser b
 */
var fmap = function (f, p) {
    return lift(f)(p);
};

exports.Body = Body;
exports.State = State;
exports.Result = Result;
exports.Maybe = Maybe;
exports.None = None;
exports.Just = Just;
exports.just = just;
exports.failure = failure;
exports.success = success;
exports.one_of = one_of;
exports.none_of = none_of;
exports.word = word;
exports.iword = iword;
exports.many = many;
exports.plus = plus;
exports.or = or;
exports.and = and;
exports.many1 = many1;
exports.separated_by = separated_by;
exports.skip = skip;
exports.option = option;
exports.any = any;
exports.eof = eof;
exports.peek = peek;
exports.not = not;
exports.prepare = prepare;
exports.lift = lift;
exports.fmap = fmap;

/*global exports */

},{}],"./lib/earlgrey/earlgrey.js":[function(require,module,exports){
module.exports=require('XrEFUk');
},{}]},{},[])