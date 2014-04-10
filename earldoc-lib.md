
# EarlDoc

EarlDoc is a Javascript documentation extraction system; it outputs
the plain text contents of all Javascript comments beginning with
`/**`, ignoring all code, inline comments, and other multiline
comments. You should use your favorite markup (or down!) system to
turn the comments into formatted documents.

[TOC]

## Implementation notes

This library was written using the EarlGrey parser; in fact, this
project was conceived as a way to both document and test EarlGrey.

The documentation for this project is, of course, generated using
EarlDoc. Specifically, all `/**`-style comments in the source code
contain valid Markdown code that is extracted using EarlDoc.

The same conventions are used for documenting types as in the
EarlGrey documentation; in particular, we employ type annotations
inspired by Haskell.

# API

## `earldoc`

The top-level object exported by the library.

### Type

    earldoc :: {String: Function}
 


## `join`

Creates a function that concatentates the contents of an array
together, with each element separated by `s`.

### Type

    join :: String -> ([String] -> String)
     


## `s`

A function used to make a parser return a string, rather than
an array of strings. `s(p)` is a shortcut for `P.fmap(join(""),
p)`.

### Type

    s :: Parser [String] -> Parser String
     


## `single_quote`

Matches a single quote, i.e. `'`.

### Type

    single_quote :: Parser String
     


## `double_quote`

Matches a double quote, i.e. `"`.

### Type

    double_quote :: Parser String
     


## `newline`

Matches a newline character.

### Type

    newline :: Parser String
     


## `escaped_single_quote`

Matches a an escaped single quote, i.e. `\'`.

### Type

    escaped_double_quote :: Parser String
     


## `escaped_double_quote`

Matches a an escaped double quote, i.e. `\"`.

### Type

    escaped_double_quote :: Parser String
     


## `star`

Matches an asterisk.

### Type

    star :: Parser String
     


## `slash`

Matches a forward slash.

### Type

    slash :: Parser String
     


## `star_not_ending_comment`

Matches an asterisk that doesn't belong to a comment
terminator.

### Type

    star_not_ending_comment :: Parser String
     


## `slash_not_starting_comment`

Matches a slash that isn't part of the start of a comment.

### Type

    slash_not_starting_comment :: Parser String
     


## `start_multiline_comment`

Matches the start of a `/*`-style comment.

### Type

    start_comment :: Parser String
     


## `end_multiline_comment`

Matches the end of a multiline comment.

### Type

    end_comment :: Parser String
     


## `start_inline_comment`

Matches the start of a `//`-style comment.

### Type

    start_comment :: Parser String
     


## `inline_comment`

Matches an inline comment.

### Type

    inline_comment :: Parser String
     


## `start_doc_comment`

Matches the start of a `/**`-style comment.

### Type

    start_comment :: Parser String
     


## `start_comment`

Matches the start of any Javascript comment.

### Type

    start_comment :: Parser String
     


## `js_single_quote`

Match a quote delimited by single quotes.

### Type

    js_single_quote :: Parser String
     


## `js_double_quote`

Match a quote delimited by double quotes.

### Type

    js_double_quote :: Parser String
     


## `not_doc_comment`

Matches a body of text that doesn't contain a documentation
comment.

### Type

    not_doc_comment :: Parser String
     


## `banner`

Matches a comment banner consisting of any amount of
whitespace, an asterisk, and optionally one space.

### Type

    banner :: Parser [String]
     


## `doc_comment_line`

Matches a line of documentation comment. Returns only the
content after the optional banner.

### Type

    doc_comment_line :: Parser String
     


## `doc_comment`

Match a comment beginning with `/**`. The comment delimiters
are discarded, with only the body of the comment being
returned.

### Type

    comment :: Parser String
     


## `doc_comments`

Match many documentation comments, possibly separated by text
that isn't in a documentation comment. Returns an array of the
bodies of comments.

### Type

    doc_comments :: Parser [String]
     