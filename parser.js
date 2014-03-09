/**
 * ParserLib
 * =========
 *
 * ParserLib defines a small library of parsers and parser combinators
 * for use in top-down, recursive-descent parsing. Although these
 * parsers are language-agnostic, this library was written for parsing
 * Scheme.
 *
 * Parsers
 * -------
 *
 * A small collection of basic parsers generators are provided;
 * documentation is available {{#crossLink "Parser"}} here
 * {{/crossLink}}. New parsers can easily be defined and used with
 * this library without extending existing types; all parsers are
 * duck-typed, and no interface is required beyond the input and
 * output types.
 *
 * Parser combinators
 * ------------------
 *
 * The parsers above can be combined to produce more complex parsers
 * through the use of parser combinators. A number of combinators are
 * provided which can be used to define a rich set of parsers;
 * documentation for parser combinators is found {{#crossLink
 * "ParserCombinator"}} here {{/crossLink}}. Like parsers, parser
 * combinators are duck-typed and so new combinators can be defined
 * and used with this library without extending existing combinators.
 *
 * Example
 * -------
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
 *     var sentence    = P.separated_by(alpha, space);
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
 * @module ParserLib
 */
var P = (function () {

    /**
     * A body of text to be parsed.
     *
     * @param name {string} The name of the body of text to be parsed.
     * @param text {string} The actual text to be parsed.
     *
     * @class Body
     * @constructor
     */
    var Body = function (name, text) {
        this.name = name;
        this.text = text;
        this.len = text.length;
    };

    /**
     * Accesses the character at position `i`. Returns the empty
     * string if `i` is out-of-bounds.
     *
     * @param i {int} The index of the character to return.
     * @return {string} The character at the index, or the empty
     * string.
     *
     * @function at
     */
    Body.prototype.at = function (i) {
        if (i < this.len) {
            return this.text[i];
        }
        return "";
    };

    /**
     * A State represents the current state of a parse of a Body.
     *
     * @param {Body} body The Body corresponding to this State.
     *
     * @class State
     * @constructor
     */
    var State = function (body) {
        this.body = body;
        this.pos = 0;
        this.cur = this.body.at(this.pos);
    };

    /**
     * Returns a string representation of the State.
     *
     * @return {string} a string representation of the State.
     *
     * @function toString
     */
    State.prototype.toString = function () {
        return this.body.name + ": " + this.pos + " [" + this.cur + "]";
    };

    /**
     * Returns a shallow copy of the current State, suitable for
     * creating State objects that can be safely modified by child
     * parsers.
     *
     * @function
     */
    State.prototype.copy = function () {
        var s = new State(this.body);
        s.pos = this.pos;
        s.cur = this.cur;
        return s;
    };

    /**
     * Consume one unit of input.
     *
     * @function
     */
    State.prototype.advance = function () {
        this.pos += 1;
        this.cur = this.body.at(this.pos);
    };

    /**
     * Consume n units of input.
     *
     * @function advance_by
     */
    State.prototype.advance_by = function (n) {
        this.pos += n;
        this.cur = this.body.at(this.pos);
    };

    /**
     * The result of a parse.
     *
     * @class Result
     * @constructor
     * @param {bool} success Was the parse successful?
     * @param {array} result A list of results.
     * @param {State} state The State after the parse.
     */
    var Result = function (success, result, state) {
        this.success = success;
        this.result = result;
        this.state = state;
    };

    /**
     * Returns a string representation of the Result.
     *
     * @return {string} a string representation of the Result.
     *
     * @function toString
     */
    Result.prototype.toString = function () {
        if (this.success) {
            return this.result.join("\n");
        }

        if (this.state.cur == "") {
            return "Failure: unexpected end-of-file";
        }
        return ("Failure: error at character " + this.state.pos
                + ": unexpected character '" + this.state.cur + "'");
    };

    var failure = function (state) {
        return new Result(false, [], state);
    };

    var success = function (result, state) {
        return new Result(true, result, state);
    };

    /**
     * Parsers
     * -------
     *
     * **Note**: there is no actual class `Parser`; rather, `Parser`
     * is used to represent any function with a certain type
     * signature, and all 'methods' listed are in fact just
     * functions. This nomenclature is due to a limitation in YUIDoc.
     *
     * A parser is a function that takes as input a {{#crossLink
     * "State"}}`State`{{/crossLink}} and returns a {{#crossLink
     * "Result"}}`Result`{{/crossLink}}. It is used to consume input
     * from a {{#crossLink "Body"}}`Body`{{/crossLink}} when the next
     * sequence of input matches a certain pattern, and consuming no
     * input otherwise.
     *
     * @class Parser
     * @static
     */

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches any single character in a `String`.
     *
     * @function one_of
     * @param {String} s
     * @return {Parser} A parser.
     *
     * @example
     *     var lower = one_of("abcdefghijklmnopqrstuvwxyz");
     */
    var one_of = function (s) {
        var len = s.length;
        return function (state) {
            var cur = state.cur;
            for (var i = 0; i < len; i++) {
                if (cur == s[i]) {
                    state.advance();
                    return success([cur], state);
                }
            }

            return failure(state);
        };
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches any single character not in a `String`. Will not match
     * the empty string `""`.
     *
     * @function none_of
     * @param {String} s
     * @return {Parser} A parser.
     *
     * @example
     *     var visible_char = none_of(" \n\t\r\f");
     */
    var none_of = function (s) {
        var len = s.length;
        return function (state) {
            var cur = state.cur;

            // Auto-fail at the end of file, since we must consume one
            // unit of input
            if (cur == "") {
                return failure(state);
            }

            for (var i = 0; i < len; i++) {
                if (cur == s[i]) {
                    return failure(state);
                }
            }

            state.advance();
            return success([cur], state);
        };
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches a `String` exactly.
     *
     * @function word
     * @param {String} s
     * @return {Parser} A parser.
     */
    var word = function (s) {
        var len = s.length;
        return function (state) {
            var a = state.pos;
            var b = a + len;

            if (state.body.text.slice(a, b) === s) {
                state.advance_by(len);
                return success([s], state);
            }

            return failure(state);
        };
    };

    /**
     * A {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches any single nonempty character; it is
     * equivalent to `none_of("")`.
     *
     * @function any
     * @param {State} s
     * @return {Result} The result of the parse.
     */
    var any = none_of("");

    /**
     * Parser combinators
     * ------------------
     *
     * A parser combinator is a function that takes as input one or
     * more {{#crossLink "Parser"}}`Parser`s{{/crossLink}} and returns
     * a new `Parser`.
     *
     * Parser combinators allow individual parsers to be used as
     * building blocks to form more complex parsers.
     *
     * **Note**: there is no actual class `ParserCombinator`; rather,
     * `ParserCombinator` is used to represent any function with a
     * certain type signature, and all 'methods' lsited are in fact
     * just functions. This nomenclature is due to a limitatinon in
     * YUIDoc.
     *
     * @class ParserCombinator
     * @static
     *
     */

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches zero or more of the provided `Parser`.
     *
     * @function many
     * @param {Parser} p
     * @return {Parser} A new parser.
     */
    var many = function (p) {
        return function (state) {
            var results = [];

            var halt = false;
            while (halt == false) {
                var s = state.copy();
                var ret = p(s);

                if (ret.success) {
                    results = results.concat(ret.result);
                    state = ret.state;
                } else {
                    halt = true;
                }
            }

            return success(results, state);
        };
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches a sequence of `Parser`s in order. Accepts any number of
     * arguments.
     *
     * @function plus
     * @param {Parser} p1
     * @param {Parser} p2
     * @param {Parser} ...
     * @return {Parser} A new parser.
     */
    var plus = function () {
        var _args = arguments;
        var _len = _args.length;

        return function (state) {
            var results = [];

            for (var i = 0; i < _len; i++) {
                var s = state.copy();
                var p = _args[i];
                var ret = p(s);

                if (ret.success == false) {
                    return ret;
                }

                results = results.concat(ret.result);
                state = ret.state;
            }

            return success(results, state);
        };
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches the first `Parser` in an ordered sequence of
     * alternatives. Accepts any number of arguments.
     *
     * @function or
     * @param {Parser} p1
     * @param {Parser} p2
     * @param {Parser} ...
     * @return {Parser} A new parser.
     */
    var or = function () {
        var _args = arguments;
        var _len = arguments.length;

        return function (state) {
            // Track the deepest we manage to parse, so if we fail we
            // give a more informative error message.
            var deepest = null;
            for (var i = 0; i < _len; i++) {
                var s = state.copy();
                var p = _args[i];
                var ret = p(s);

                if (ret.success) {
                    return success([ret.result], ret.state);
                } else {
                    if (deepest == null || ret.state.pos > deepest.state.pos) {
                        deepest = ret;
                    }
                }
            }

            return deepest;
        };
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches one or more of the provided `Parser`. The parser
     *
     *     var ex = many1(p);
     *
     * could be equivalently defined as
     *
     *     var ex = plus(p, many(p));
     *
     * @function many1
     * @param {Parser} p
     * @return {Parser} A new parser.
     */
    var many1 = function (p) {
        return plus(p, many(p));
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches the provided `Parser`, but throws away the result.
     *
     * @function skip
     * @param {Parser} p
     * @return {Parser} A new parser.
     */
    var skip = function (p) {
        return function (state) {
            var result = p(state);

            if (result.success == false) {
                return result;
            }

            return success([], result.state);
        };
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * matches zero or more of provided `Parser`, consuming and
     * skipping another parser in between each. The parser
     *
     *     var ex = separated_by(p, q);
     *
     * is equivalent to
     *
     *     var ex = plus(p, many(plus(skip(q), p)));
     *
     * @function separated_by
     * @param {Parser} p The `Parser` to match.
     * @param {Parser} q The `Parser` to skip.
     * @return {Parser} A new parser.
     */
    var separated_by = function (p, q) {
        return plus(p, many(plus(skip(q), p)));
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * either matches zero or one of a `Parser`.
     *
     * **Note**: any `Parser` returned by `maybe` can always succeed
     * by matching zero instances of the original parser.
     *
     * @function maybe
     * @param {Parser} p
     * @return {Parser} A new parser.
     */
    var maybe = function (p) {
        return function (state) {
            var result = p(state.copy());

            if (result.success == false) {
                return success([], state);
            }

            return result;
        };
    };

    /**
     * Creates a {{#crossLink "Parser"}}`Parser`{{/crossLink}} that
     * will attempt to match the given `Parser`, but consumes no input
     * on success.
     *
     * **Note**: if a `peek`-created parser will succeed once, it will
     * succeed (infinitely) many times; use with caution.
     *
     * @function peek
     * @param {Parser} p
     * @return {Parser} A new parser.
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

    return {
        Body: Body,
        State: State,
        Result: Result,
        failure: failure,
        success: success,
        one_of: one_of,
        none_of: none_of,
        word: word,
        many: many,
        plus: plus,
        or: or,
        many1: many1,
        separated_by: separated_by,
        skip: skip,
        maybe: maybe,
        any: any,
        peek: peek
    };
})();
