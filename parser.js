/**
 * # EarlGrey
 *
 * EarlGrey defines a small library of parsers and parser combinators
 * for use in top-down, recursive-descent parsing. Although these
 * parsers are language-agnostic, this library was written for parsing
 * Scheme.
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
 * generators (of type `a -> Result -> State`). New parsers can be
 * defined with parser combinators (discussed below) or simply by
 * defining any function of the appropriate type.
 *
 * Formally, we define the parser type as
 *     type Parser a = State -> Result (Maybe a)
 *
 * Parser combinators
 * ------------------
 *
 * A parser combinator is any function that, when given one or more
 * parsers as input, produces a new parser; that is, any function of
 * type `Parser -> Parser`, `(Parser, Parser) -> Parser`, etc. We
 * provide a number of parser combinators that can be used to define a
 * rish set of parsers. Like parsers, a new parser combinators can be
 * defined simply by defining any function of the appropriate type.
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
 */
var P = (function () {

    /**
     * ## `Maybe`
     *
     * A `Maybe` value represents a value that can either have some
     * value or no value.
     */
    var Maybe = function (has_value, value) {
        this.has_value = has_value;
        this.value = value;
    };

    /**
     * ## `Maybe.map`
     *
     * Apply a function to the stored value, if any.
     *
     * ### Type
     *
     *     Maybe.map :: (a -> b) -> Maybe a -> Maybe b
     */
    Maybe.prototype.map = function (f) {
        if (this.has_value) {
            this.value = f(this.value);
        }

        return this;
    };

   /**
     * ## `Just`
     *
     * A constructor for `Maybe` values that store a value.
     */
    var Just = function (x) {
        this.has_value = true;
        this.value = x;
    };
    Just.prototype = new Maybe();

    /**
     * ## `None`
     *
     * A `Maybe` that stores no value.
     *
     */
    var None = new Maybe(false, null);
    
    /**
     * ## `just`
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
     * ## `Body`
     *
     * A body of text to be parsed.
     */
    var Body = function (name, text) {
        this.name = name;
        this.text = text;
        this.len = text.length;
    };

    /**
     * ## `Body.at`
     *
     * Returns the character at position `i`, or the empty string if
     * `i` is out-of-bounds.
     *
     * ### Type
     *
     *     Body.at :: Number -> String
     */
    Body.prototype.at = function (i) {
        if (i < this.len) {
            return this.text[i];
        }
        return "";
    };

    /**
     * ## `State`
     *
     * A `State` represents the position of a parse in a `Body`.
     */
    var State = function (body) {
        this.body = body;
        this.pos = 0;
        this.cur = this.body.at(this.pos);
    };

    /**
     * ## `State.toString`
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
     * ## `State.copy`
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
     * ## `State.advance`
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
     * ## `State.advance_by`
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
     * ## `Result`
     *
     * Instances of this class represent the result of a parse. When a
     * parse is successful, the `Result` stores a `Maybe a` value,
     * where storing `none` indicates that no value was returned, and
     * the `.success` attribute will be `true`. When the parse is
     * unsuccessful, no value (i.e., `null`) is stored and the
     * `.success` attribute will be `false`.
     */
    var Result = function (success, result, state) {
        // Was the parse successful?
        this.success = success;

        // The result of the parse (should be a Maybe)
        this.result = result;

        // The state after the parse
        this.state = state;
    };

    /**
     * ## `Result.toString`
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

    /**
     * ## `failure`
     *
     * Constructs a failed `Result` at the given `State`.
     *
     * ### Type
     *
     *     failure :: State -> Result None
     */
    var failure = function (state) {
        return new Result(false, None, state);
    };

    /**
     * ## `success`
     *
     * Constructs a successful `Result` with the given value at the
     * given `State`.
     *
     * ### Type
     *
     *     success :: (a, State) -> Result (Just a)
     */
    var success = function (result, state) {
        return new Result(true, just(result), state);
    };

    /**
     * ## `one_of`
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
            var cur = state.cur;
            for (var i = 0; i < len; i++) {
                if (cur == s[i]) {
                    state.advance();
                    return success(cur, state);
                }
            }

            return failure(state);
        };
    };

    /**
     * ## `none_of`
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
            return success(cur, state);
        };
    };

    /**
     * ## `word`
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
            var a = state.pos;
            var b = a + len;

            if (state.body.text.slice(a, b) === s) {
                state.advance_by(len);
                return success(s, state);
            }

            return failure(state);
        };
    };

    /**
     * ## `iword`
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
            var a = state.pos;
            var b = a + len;

            if (state.body.text.slice(a, b).toLowerCase() === s) {
                state.advance_by(len);
                return success(s, state);
            }

            return failure(state);
        };
    };

    /**
     * ## `any`
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
     * ## `eof`
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
        if (state.pos == state.body.len) {
            return success("", state);
        }

        return failure(state);
    };

    /**
     * ## `many`
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

            return success(results, state);
        };
    };

    /**
     * ## `plus`
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

            return success(results, state);
        };
    };

    /**
     * ## `or`
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
            return failure(state);
        };
    };

    /**
     * ## `and`
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
     * ## `many`
     *
     * A parser combinator that creates parsers which match a parser
     * one or more times.
     *
     * ### Example
     *
     *     var how_exciting = many(word("!"));
     *
     * ### Type
     *
     *     many :: Parser a -> Parser [a]
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
     * ## `skip`
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
            var result = p(state);

            if (result.success == false) {
                return result;
            }

            return new Result(true, None, result.state);
        };
    };

    /**
     * ## `separated_by`
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
     * ## `option`
     *
     * Creates a parser that matches zero or one of a given parser. If
     * the parser cannot be matched, the result will store `None`,
     * otherwise it will store a `Just`.
     *
     * ### Example
     *
     *     var optional_sign = plus(option(one_of("+-")),
     *                              many1(one_of("0123456789")));
     *
     * ### Type
     *
     *     option :: Parser a -> Parser a
     */
    var option = function (p) {
        return function (state) {
            var result = p(state.copy());

            if (result.success == false) {
                return new Result(true, None, state);
            }

            return result;
        };
    };

    /**
     * ## `peek`
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
     * ## `not`
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
            var result = p(state.copy());
            
            if (result.success) {
                return failure(state);
            }

            return any(state);
        };
    };

    /**
     * ## `prepare`
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
                result.result.map(f);
                return result;
            };
        };
    };

    /**
     * ## `fmap`
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

    return {
        Body: Body,
        State: State,
        Result: Result,
        Maybe: Maybe,
        None: None,
        Just: Just,
        just: just,
        failure: failure,
        success: success,
        one_of: one_of,
        none_of: none_of,
        word: word,
        iword: iword,
        many: many,
        plus: plus,
        or: or,
        and: and,
        many1: many1,
        separated_by: separated_by,
        skip: skip,
        option: option,
        any: any,
        eof: eof,
        peek: peek,
        not: not,
        prepare: prepare,
        lift: lift,
        fmap: fmap
    };
})();
