
# EarlGrey

EarlGrey defines a small library of parsers and parser combinators
for use in top-down, recursive-descent parsing. Although these
parsers are language-agnostic, this library was written for parsing
Scheme.

[TOC]

## Type annotations

We use a type annotation system inspired by Haskell's, with the
following modifications to accomodate for Javascript's nonpure
behavior.

*   Javascript supports functions with no arguments. We denote this by
    having no type before the arrow. For example,

        var f = function () {
            return 0;
        };

    would have type `-> Number`.

*   Javascript supports functions with no return type. We denote this
    by having no type after the arrow. For example, in

        var count = 0;
        var add_to = function (x) {
            count += x;
        };

    the function `add_to` would have type `Number ->`.

*   These two notations can be combined. For example, in

        var count = 0;
        var inc = function () {
            count += 1;
        };

    the function `inc` would have type `->`.

## Parsers

We define a parser as any function that accepts a `State` and
returns a `Result`; that is, a function of type `State ->
Result`. We define a small collection of basic parsers and parser
generators (of type `a -> State -> Result`). New parsers can be
defined with parser combinators (discussed below) or simply by
defining any function of the appropriate type.

Formally, we define the parser type as
    type Parser a = State -> Result (Maybe a)

### Parser combinators

A parser combinator is any function that, when given one or more
parsers as input, produces a new parser; that is, any function of
type `Parser -> Parser`, `(Parser, Parser) -> Parser`, etc. We
provide a number of parser combinators that can be used to define a
rich set of parsers. Like parsers, a new parser combinators can be
defined simply by defining any function of the appropriate type.

### Example

First we define several simple parsers to match parenthesis,
spaces, and letters in the basic English alphabet.

    var space       = P.word(" ");
    var left_paren  = P.word("(");
    var right_paren = P.word(")");
    var alpha       = P.one_of("abcdefghijklmnopqrstuvwxyz" +
                               "ABCDEFGHIJKLMNOPQRSTUVWXYZ");

We can make new parsers to match entire words or a sequence of
words separated by spaces.

    var word        = P.many1(alpha);
    var sentence    = P.separated_by(word, space);

Finally, we can match a parenthetical remark by combining these
parsers.

    var remark      = P.plus(left_paren,
                             sentence,
                             right_paren);

We could use this parser as follows.

    var body = new Body("Example text", "(Hello world)");
    var state = new State(body);
    var result = remark(state);

    // has value true
    var x = result.success;

    // has value ["(", "Hello", " ", "world", ")"]
    var y = result.result;

 


## Maybe

A `Maybe` value represents a value that can either have some
value or no value.
 


## Maybe.map

Apply a function to the stored value, if any. Optionally pass
in the Result context.

### Type

    Maybe.map :: (a -> b) -> Maybe a -> Maybe b
    Maybe.map :: ((a -> b), Result a) -> Maybe a -> Maybe b
 


## Just

A constructor for `Maybe` values that store a value.
 


## None

A `Maybe` that stores no value.

 


## just

Constructs a new `Maybe` value that stores the given value.

### Type

    just :: a -> Just a
 


## Body

A body of text to be parsed.
 


## Body.at

Returns the character at position `i`, or the empty string if
`i` is out-of-bounds.

### Type

    Body.at :: int -> String
 


## Body.line_column

Returns the line (1-based) and column (0-based) of a given
character index.

### Type

    Body.at :: int -> {line: int, column: int}
 


## State

A `State` represents the position of a parse in a `Body`.
 


## State.toString

Returns a `String` representation of this object.

### Type

    State.toString :: -> String
 


## State.copy

Returns a shallow copy of the `State`, suitable for creating
`State` objects that can be safely modified by child parsers.

### Type

    State.copy :: -> State
 


## State.advance

Consumes one unit of input in the `State`.

### Type

    State.advance :: ->
 


## State.advance_by

Consume `n` units of input in the `State`.

### Type

    State.advance_by :: Number ->
 


## Result

Instances of this class represent the result of a parse. When a
parse is successful, the `Result` stores a `Maybe a` value,
where storing `none` indicates that no value was returned, and
the `.success` attribute will be `true`. When the parse is
unsuccessful, no value (i.e., `null`) is stored and the
`.success` attribute will be `false`.
 


## Result.toString

Returns a `String` representation of this object.

### Type

    Result.toString :: -> String
 


## failure

Constructs a failed `Result` at the given `State`.

### Type

    failure :: State -> Result None
 


## success

Constructs a successful `Result` with the given value at the
given `State`.

### Type

    success :: (a, State) -> Result (Just a)
 


## one_of

A parser generator that produces parsers which match one of any
character in a string.

### Example

    var lower = one_of("abcdefghijklmnopqrstuvwxyz");

### Type

    one_of :: String -> Parser String
 


## none_of

A parser generator that produces parsers which match one of any
character not in a String.

### Example

    var visible = none_of(" \t\n\r\f");

### Type

    none_of :: String -> Parser String
 


## word

A parser generator that produces parsers which match a String
exactly.

### Example

    var my_name = word("Patrick");

### Type

    word :: String -> Parser String
 


## iword

A parser generator that produces parsers which match a String,
ignoring case.

### Example

    var my_name = iword("patrick");

### Type

    iword :: String -> Parser String
 


## any

A parser that matches any single character. This parser can
only fail if there is no input left to consume.

### Type

    any :: Parser String
 


## eof

A parser that matches the end of a file (or the end of a body
of text). It stores the empty string on success. The state is
not advanced, and so this can be matched many times.

### Type

    any :: Parser String
 


## many

A parser combinator that creates parsers which match a parser
zero or more times.

### Example

    var how_exciting = many(word("!"));

### Type

    many :: Parser a -> Parser [a]
 


## plus

A parser combinator that creates a parser which matches a
sequence of parsers.

### Example

    var _word = many(one_of("abcdefghijklmnopqrstuvwxyz"));
    var word_pair = plus(_word, word(" "), _word);

### Type

    plus :: (Parser a, Parser b, ...) -> Parser [a, b, ...]
 


## or

A parser combinator that creates a parser which matches the
first of several alternatives to succeed.

### Example

    var a_or_b = or(word("a"), word("b"));

### Type

    or :: (Parser a, Parser b, ...) -> Parser a|b|...
 


## and

A parser combinator that creates a parser which matches the
each of several parsers to succeed. Returns a Parser with the
same type as the first argument provided.

### Type

    and :: (Parser a, Parser b, ...) -> Parser a
 


## many1

A parser combinator that creates parsers which match a parser
one or more times.

### Example

    var how_exciting = many1(word("!"));

### Type

    many1 :: Parser a -> Parser [a]
 


## skip

A parser combinator that creates a parser that matches another
parser but throws away the result.

### Example

    // This parser will extract a single character from inside
    // parentheses
    var inside = plus(skip(word("(")), any, skip(word(")")));

### Type

    skip :: Parser a -> Parser none

 


## separated_by

Creates a parser that matches one or more of one parser with
each copy separated by a match of another.

### Example

// Matches "!","!?!", "!?!?!", ...
var alt = separated_by(word("!"), word("?")); 

### Type

    separated_by :: Parser a -> Parser b -> Parser [(a|b)]
 


## option

Creates a parser that matches zero or one of a given parser. If
the parser matches, a `Just` is stored. If the parser fails to
match and a default value is stored, that value is stored as a
`Just`. Otherwise, a `None` is stored..

### Example

    var optional_sign = plus(option(one_of("+-")),
                             many1(one_of("0123456789")));

### Type

    option :: Parser a -> Parser a
    option :: (Parser a, b) -> Parser (a|b)
 


## peek

Creates a Parser that consumes no input on success. On failure,
state *is* consumed to allow for useful error messages;
however, this behavior is the same as all other parsers, and so
backtracking will still work.

### Example

    var followed_by_x = plus(p, peek(word("x")));

### Note

If a `peek`-created parser will succeed once, it will succeed
(infinitely) many times; be careful with `many` and `many1`.

### Type

    peek :: Parser a -> Parser a
 


## not

Creates a new parser that fails when the provided parser
matches and succeeds otherwise; on success, a single character
is consumed.

Creates a Parser that consumes no input and only succeeds when
the provided parser fails.

### Example 1

Match the division operator "/", but not the start of a comment
"/*".

    plus(word("/"), peek(not("*")));

### Example 2

Match content encased by a delimeter described by a parser `p`.

    plus(p, many(not(p)), p);

### Type

    not :: Parser a -> Parser a
 


## prepare

A convenience function for creating a Body and State for some
text.

### Example

    var result = many("!")(prepare("!!"));

### Type

    prepare :: String -> State
 


## `lift`

Takes in a function `f :: a -> b` and returns a function `g ::
Parser a -> Parser b`.

### Type

    lift :: (a -> b) -> (Parser a -> Parser b)
 


## fmap

Given a function and a parser, lift the function, apply it to
the parser, and return the result.

### Type

    fmap :: (a -> b) -> Parser a -> Parser b
 
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
 