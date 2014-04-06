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
var earldoc = (function () {

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
    var not_doc_comment = s(P.many(P.or(js_single_quote,
                                        js_double_quote,
                                        inline_comment,
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

    return {
        parse: parse,
        js_single_quote: js_single_quote,
        js_double_quote: js_double_quote,
        banner: banner,
        doc_comment_line: doc_comment_line,
        doc_comment: doc_comment,
        not_doc_comment: not_doc_comment,
        doc_comments: doc_comments
    };
})();

/*global P*/
