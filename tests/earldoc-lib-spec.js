var P = require("./lib/earlgrey/earlgrey.js");
var E = require("./earldoc-lib.js");

describe("EarlDoc", function () {

    var matches = function (result, text) {
        expect(result.success).toBeTruthy();
        expect(result.result.has_value).toBeTruthy();
        expect(result.result.value).toEqual(text);
        expect(result.state.pos).toEqual(text.length);
    };

    var single_quote = "'Hello'";
    var double_quote = '"Hello"';

    var doc_comment = "/**Hello\ntest*/";
    var doc_comment_with_banner = "/**Hello\n * test\n * test*/";
    var inline_comment = "// Hello";

    describe("js_single_quote", function () {
        it("can match the empty quote", function () {
            var text = "''";
            var result = E.js_single_quote(P.prepare(text));

            matches(result, text);
        });

        it("can match nonempty quotes", function () {
            var text = "'test'";
            var result = E.js_single_quote(P.prepare(text));

            matches(result, text);
        });

        it("can match quotes with escaped single quotes", function () {
            var text = "'te\\'st'";
            var result = E.js_single_quote(P.prepare(text));

            matches(result, text);
        });

        it("doesn't match quotes with missing delimiters", function () {
            var text = "'test";
            var result = E.js_single_quote(P.prepare(text));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(text.length);
        });

        it("doesn't match strings that aren't quotes", function () {
            var text = "test";
            var result = E.js_single_quote(P.prepare(text));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });
    });

    describe("js_double_quote", function () {
        it("can match the empty quote", function () {
            var text = '""';
            var result = E.js_double_quote(P.prepare('""'));

            matches(result, text);
        });

        it("can match nonempty quotes", function () {
            var text = '"te\\"st"';
            var result = E.js_double_quote(P.prepare(text));

            matches(result, text);
        });

        it("can match quotes with escaped double quotes", function () {
            var text = '"te\\"st"';
            var result = E.js_double_quote(P.prepare(text));

            matches(result, text);
        });

        it("doesn't match quotes with missing delimiters", function () {
            var text = '"test';
            var result = E.js_double_quote(P.prepare(text));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(text.length);
        });

        it("doesn't match strings that aren't quotes", function () {
            var text = "test";
            var result = E.js_single_quote(P.prepare(text));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });
    });

    describe("banner", function () {
        it("eats leading spaces in a banner", function () {
            var text = "     * text";
            var result = E.banner(P.prepare(text));
            
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.state.pos).toEqual(7);
        });

        it("optionally eats one space after the first asterisk", function () {
            var text = "* text";
            var result = E.banner(P.prepare(text));
            
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.state.pos).toEqual(2);

            text = "*text";
            result = E.banner(P.prepare(text));
            
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.state.pos).toEqual(1);
        });

        it("fails when there is no leading asterisk", function () {
            var text = "  text * ";
            var result = E.banner(P.prepare(text));
            
            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(2);
        });

        it("doesn't match just whitespace", function () {
            var text = "  ";
            var result = E.banner(P.prepare(text));
            
            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(2);
        });
    });

    describe("doc_comment_line", function () {
        it("matches a line", function () {
            var text = "  test test test test  \n";
            var result = E.doc_comment_line(P.prepare(text));

            matches(result, text);
        });

        it("matches a line with a banner", function () {
            var text = " * test test test test\n";
            var exp = "test test test test\n";
            var result = E.doc_comment_line(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(exp);
            expect(result.state.pos).toEqual(exp.length + 3);
        });

        it("matches a line ending the comment", function () {
            var text = " * test test test test*/";
            var exp = "test test test test";
            var result = E.doc_comment_line(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(exp);
            expect(result.state.pos).toEqual(exp.length + 3);
        });
    });

    describe("doc_comment", function () {
        it("matches one-line comments", function () {
            var text = "/** text */";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(" text ");
            expect(result.state.pos).toEqual(text.length);
        });

        it("matches multi-line comments", function () {
            var text = "/** text\ntext\ntext*/";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(" text\ntext\ntext");
            expect(result.state.pos).toEqual(text.length);
        });

        it("matches one-line comments with a banner", function () {
            var text = "/** * text*/";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("text");
            expect(result.state.pos).toEqual(text.length);
        });

        it("matches multi-line comments with a banner", function () {
            var text = "/** * text\n  * text\n   * text*/";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("text\ntext\ntext");
            expect(result.state.pos).toEqual(text.length);
        });


        it("matches multi-line comments with mixed banner use", function () {
            var text = "/** * text\n   text\n   * text*/";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("text\n   text\ntext");
            expect(result.state.pos).toEqual(text.length);
        });

        it("doesn't match text with leading /*", function () {
            var text = "/* * text*/";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(2);
        });

        it("doesn't match inline comments", function () {
            var text = "// * text*/";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(1);
        });

        it("doesn't match 'comments' missing the opening /**", function () {
            var text = " * text*/";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("doesn't match 'comments' missing the closing */", function () {
            var text = "/** * text";
            var result = E.doc_comment(P.prepare(text));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(3);
        });
    });

    describe("not_doc_comment", function () {
        it("matches plain text", function () {
            var text = "lorem ipsum";
            var result = E.not_doc_comment(P.prepare(text));

            matches(result, text);
        });

        it("matches text with comments embedded in single quotes", function () {
            var text = "asdf '/** asdf */'";
            var result = E.not_doc_comment(P.prepare(text));

            matches(result, text);
        });

        it("matches text with comments embedded in double quotes", function () {
            var text = "asdf \"/** asdf */\"";
            var result = E.not_doc_comment(P.prepare(text));

            matches(result, text);
        });

        it("matches text with inline comments", function () {
            var text = "text\n//comment\ntext//comment";
            var result = E.not_doc_comment(P.prepare(text));

            matches(result, text);
        });

        it("matches text with comments embedded in inline comments", function () {
            var text = "///**asdf*/";
            var result = E.not_doc_comment(P.prepare(text));

            matches(result, text);
        });
    });

    describe("doc_comments", function () {
        it("matches no comments", function () {
            var text = "text";
            var result = E.doc_comments(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([]);
            expect(result.state.pos).toEqual(text.length);            
        });

        it("matches one comment", function () {
            var text = "/**text*/";
            var result = E.doc_comments(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["text"]);
            expect(result.state.pos).toEqual(text.length);            
        });

        it("matches many comments", function () {
            var text = "/**text*//**text*/";
            var result = E.doc_comments(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["text", "text"]);
            expect(result.state.pos).toEqual(text.length);            
        });

        it("matches one comment after text", function () {
            var text = "asdf/**text*/";
            var result = E.doc_comments(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["text"]);
            expect(result.state.pos).toEqual(text.length);            
        });

        it("matches one comment before text", function () {
            var text = "/**text*/asdf";
            var result = E.doc_comments(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["text"]);
            expect(result.state.pos).toEqual(text.length);            
        });

        it("matches one comment surrounded by text", function () {
            var text = "asdf/**text*/asdf";
            var result = E.doc_comments(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["text"]);
            expect(result.state.pos).toEqual(text.length);            
        });

        it("matches many comments surrounded by text", function () {
            var text = "asdf/**text*/asdf/**txet*/fdsa";
            var result = E.doc_comments(P.prepare(text));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["text", "txet"]);
            expect(result.state.pos).toEqual(text.length);            
        });
    });
});

/* Keep JSLint happy */
/*global describe it expect */
/*global require */

