/* A Jasmine test file */

describe("Classes", function () {
    var text = "test text";
    var name = "test name";
    var body;
    var state;
    var success;
    var failure;

    beforeEach(function () {
        body = new P.Body(name, text);
        state = new P.State(body);
        success = new P.Result(true, new P.Maybe(true, 8), state);
        failure = new P.Result(false, null, state);
    });

    describe("Maybe", function () {

        var just;
        var none;

        beforeEach(function () {
            just = new P.Maybe(true, 8);
            none = new P.Maybe(false, null);
        });

        it("constructs", function () {
            var maybe = new P.Maybe(true, 8);

            expect(maybe.has_value).toBeTruthy();
            expect(maybe.value).toEqual(8);

            maybe = new P.Maybe(false, null);

            expect(maybe.has_value).toBeFalsy();
            expect(maybe.value).toBeNull();
        });

        it("can map values", function () {
            just.map(function (x) {return x * 2;});

            expect(just.has_value).toBeTruthy();
            expect(just.value).toEqual(16);

            none.map(function (x) {return "string";});

            expect(none.has_value).toBeFalsy();
            expect(none.value).toBeNull();
        });
    });

    describe("Just", function () {
        it("constructs", function () {
            var maybe = new P.Just(8);

            expect(maybe.has_value).toBeTruthy();
            expect(maybe.value).toEqual(8);
        });

        it("can be constructed with just", function () {
            var just = P.just(8);

            expect(just.has_value).toBeTruthy();
            expect(just.value).toEqual(8);
        });
    });

    describe("None", function () {
        it("is a value", function () {
            var maybe = P.None;

            expect(maybe.has_value).toBeFalsy();
            expect(maybe.value).toBeNull();
        });
    });

    describe("Body", function () {
        it("constructs", function () {
            expect(true).toBeTruthy();// beforeEach didn't throw
        });

        it("stores text", function () {
            expect(body.text).toEqual(text);
        });

        it("is named", function () {
            expect(body.name).toEqual(name);
        });

        it("can be accessed with it", function () {
            for (var i = 0; i < text.length; i++) {
                expect(body.at(i)).toEqual(text[i]);
            }

            expect(body.at(text.length)).toEqual("");
        });
    });

    describe("State", function () {
        it("constructs", function () {
            expect(true).toBeTruthy();// beforeEach didn't throw
        });

        it("copies", function () {
            var copy = state.copy();

            copy.advance();

            expect(copy.pos).not.toEqual(state.pos);
            expect(copy.cur).not.toEqual(state.cur);
        });

        it("advances", function () {
            expect(state.cur).toEqual("t");
            expect(state.pos).toEqual(0);

            state.advance();

            expect(state.cur).toEqual("e");
            expect(state.pos).toEqual(1);
        });

        it("advances by n", function () {
            expect(state.cur).toEqual("t");
            expect(state.pos).toEqual(0);

            state.advance_by(2);

            expect(state.cur).toEqual("s");
            expect(state.pos).toEqual(2);
        });

        describe("prepare", function () {
            it("prepares text", function () {
                var s = P.prepare("");
                expect(s instanceof P.State).toBeTruthy();

                s = P.prepare("asdf");
                expect(s instanceof P.State).toBeTruthy();

            });
        });
    });

    describe("Result", function () {
        it("constructs", function () {
            expect(true).toBeTruthy();// beforeEach didn't throw
        });

        it("can be successful", function () {
            expect(success.success).toBeTruthy();
            expect(success.result.has_value).toBeTruthy();
            expect(success.result.value).toEqual(8);
        });

        it("can be a failure", function () {
            expect(failure.success).toBeFalsy();
            expect(failure.result).toBeNull();
        });

        it("can be constructed with failure", function () {
            var result = P.failure();
            expect(result.success).toBeFalsy();
            expect(result.result).toBe(P.None);
        });

        it("can be constructed with success", function () {
            var result = P.success(8, state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(8);
        });
    });
});

describe("Parsers", function () {
    var text = "test text";
    var name = "test name";
    var body;
    var state;

    beforeEach(function () {
        body = new P.Body(name, text);
        state = new P.State(body);
    });

    describe("one_of", function () {
        it("fails on empty", function () {
            var result = P.one_of("")(state);
            expect(result.success).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("can match one character", function () {
            var result = P.one_of("t")(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("t");
            expect(result.state.pos).toEqual(1);
        });

        it("can match more than one character", function () {
            var p = P.one_of("abc");

            var strings = ["abc", "bca", "cab"];
            for (var i = 0; i < strings.length; i++) {
                var s = strings[i];

                var result = p(P.prepare(s));

                expect(result.success).toBeTruthy();
                expect(result.result.has_value).toBeTruthy();
                expect(result.result.value).toEqual(s[0]);
                expect(result.state.pos).toEqual(1);
            }
        });

        it("can fail to match", function () {
            var result = P.one_of("s")(state);
            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });
    });

    describe("none_of", function () {
        it("succeeds on empty", function () {
            var result = P.none_of("")(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(text[0]);
            expect(result.state.pos).toEqual(1);
        });

        it("can not match one character", function () {
            var result = P.none_of("s")(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("t");
            expect(result.state.pos).toEqual(1);
        });

        it("can not match more than one character", function () {
            var p = P.none_of("defghijklmnopqrstuvwxyz");

            var strings = ["abc", "bca", "cab"];
            for (var i = 0; i < strings.length; i++) {
                var s = strings[i];

                var result = p(P.prepare(s));

                expect(result.success).toBeTruthy();
                expect(result.result.has_value).toBeTruthy();
                expect(result.result.value).toEqual(s[0]);
                expect(result.state.pos).toEqual(1);
            }
        });

        it("can fail to match", function () {
            var result = P.none_of("t")(state);
            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });
    });

    describe("word", function () {
        it("succeeds on empty", function () {
            var result = P.word("")(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("");
            expect(result.state.pos).toEqual(0);
        });

        it("can match one character", function () {
            var result = P.word("t")(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("t");
            expect(result.state.pos).toEqual(1);
        });

        it("can match a word", function () {
            var result = P.word("test")(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("test");
            expect(result.state.pos).toEqual(4);
        });

        it("can fail to match", function () {
            var result = P.one_of("s")(state);
            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });
    });

    describe("any", function () {
        it("matches anything", function () {
            var result = P.any(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("t");
            expect(result.state.pos).toEqual(1);
        });

        it("...except the empty string", function () {
            var result = P.any(P.prepare(""));
            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });
    });

    describe("many", function () {
        it("matches zero times", function () {
            var result = P.many(P.word("test"))(P.prepare("x"));
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([]);
            expect(result.state.pos).toEqual(0);
        });

        it("matches once", function () {
            var result = P.many(P.word("test"))(P.prepare("testx"));
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["test"]);
            expect(result.state.pos).toEqual(4);
        });

        it("matches many times", function () {
            var result = P.many(P.word("test"))(P.prepare("testtesttest"));
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["test", "test", "test"]);
            expect(result.state.pos).toEqual(12);
        });
    });

    describe("plus", function () {
        it("matches one parser", function () {
            var p1 = P.word("test");

            var result = P.plus(p1)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["test"]);
            expect(result.state.pos).toEqual(4);
        });

        it("matches many parsers", function () {
            var p1 = P.word("test");
            var p2 = P.word(" ");
            var p3 = P.word("text");

            var result = P.plus(p1, p2, p3)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["test", " ", "text"]);
            expect(result.state.pos).toEqual(9);
        });

        it("can fail on one parser", function () {
            var p1 = P.word("tset");

            var result = P.plus(p1)(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("can fail on the first of many parsers", function () {
            var p1 = P.word("tset");
            var p2 = P.word(" ");
            var p3 = P.word("text");

            var result = P.plus(p1, p2, p3)(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("can fail in the middle of many parsers", function () {
            var p1 = P.word("test");
            var p2 = P.word("-");
            var p3 = P.word("text");

            var result = P.plus(p1, p2, p3)(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(4); // We parsed some values
        });

        it("can fail at the end of many parsers", function () {
            var p1 = P.word("test");
            var p2 = P.word(" ");
            var p3 = P.word("txet");

            var result = P.plus(p1, p2, p3)(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(5); // We parsed some values
        });

    });

    describe("or", function () {
        it("can match with one alternative", function () {
            var p1 = P.word("test");

            var result = P.or(p1)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("test");
            expect(result.state.pos).toEqual(4);
        });

        it("can match the first of many alternatives", function () {
            var p1 = P.word("test");
            var p2 = P.word(" ");
            var p3 = P.word("text");

            var result = P.or(p1, p2, p3)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("test");
            expect(result.state.pos).toEqual(4);
        });

        it("can match in the middle of many alternatives", function () {
            var p1 = P.word("test");
            var p2 = P.word(" ");
            var p3 = P.word("text");

            var result = P.or(p3, p1, p2)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("test");
            expect(result.state.pos).toEqual(4);
        });

        it("can match at the end of many alternatives", function () {
            var p1 = P.word("test");
            var p2 = P.word(" ");
            var p3 = P.word("text");

            var result = P.or(p2, p3, p1)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("test");
            expect(result.state.pos).toEqual(4);
        });

        it("can fail with one alternative", function () {
            var p1 = P.word("tset");

            var result = P.or(p1)(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("can fail with many alternatives", function () {
            var p1 = P.word("tset");
            var p2 = P.word("-");
            var p3 = P.word("txet");

            var result = P.or(p1, p2, p3)(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });
    });

    describe("many1", function () {
        it("fails on zero matches", function () {
            var result = P.many1(P.word("test"))(P.prepare("x"));
            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("matches once", function () {
            var result = P.many1(P.word("test"))(P.prepare("testx"));
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["test"]);
            expect(result.state.pos).toEqual(4);
        });

        it("matches many times", function () {
            var result = P.many1(P.word("test"))(P.prepare("testtesttestx"));
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["test", "test", "test"]);
            expect(result.state.pos).toEqual(12);
        });
    });

    describe("skip", function () {
        it("skips matches", function () {
            var p1 = P.word("test");

            var result = P.skip(p1)(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(4);
        });

        it("can fail", function () {
            var p1 = P.word("tset");

            var result = P.skip(p1)(state);
            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("plays nicely with plus when first", function () {
            var p1 = P.word("test");
            var p2 = P.word(" ");
            var p3 = P.word("text");

            var result = P.plus(P.skip(p1), p2, p3)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([" ", "text"]);
            expect(result.state.pos).toEqual(9);
        });

        it("plays nicely with plus when in the middle", function () {
            var p1 = P.word("test");
            var p2 = P.word(" ");
            var p3 = P.word("text");

            var result = P.plus(p1, P.skip(p2), p3)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["test", "text"]);
            expect(result.state.pos).toEqual(9);
        });

        it("plays nicely with plus when at the end", function () {
            var p1 = P.word("test");
            var p2 = P.word(" ");
            var p3 = P.word("text");

            var result = P.plus(p1, p2, P.skip(p3))(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["test", " "]);
            expect(result.state.pos).toEqual(9);
        });

        it("plays nicely with or", function () {
            var p1 = P.word("test");
            var p2 = P.word("-");
            var p3 = P.word("txet");

            var result = P.or(P.skip(p1), p2, p3)(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(4);
        });

        it("plays nicely with many matching zero times", function () {
            var p1 = P.word("test");

            var result = P.many(P.skip(p1))(P.prepare("x"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([]);
            expect(result.state.pos).toEqual(0);
        });

        it("plays nicely with many matching one time", function () {
            var p1 = P.word("test");

            var result = P.many(P.skip(p1))(P.prepare("testx"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([]);
            expect(result.state.pos).toEqual(4);
        });

        it("plays nicely with many matching many times", function () {
            var p1 = P.word("test");

            var result = P.many(P.skip(p1))(P.prepare("testtesttestx"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([]);
            expect(result.state.pos).toEqual(12);
        });

        it("plays nicely with many1 when failing", function () {
            var p1 = P.word("test");

            var result = P.many1(P.skip(p1))(P.prepare("x"));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("plays nicely with many1 matching one time", function () {
            var p1 = P.word("test");

            var result = P.many1(P.skip(p1))(P.prepare("testx"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([]);
            expect(result.state.pos).toEqual(4);
        });

        it("plays nicely with many1 matching many times", function () {
            var p1 = P.word("test");

            var result = P.many1(P.skip(p1))(P.prepare("testtesttestx"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([]);
            expect(result.state.pos).toEqual(12);
        });

        it("plays nicely with separated_by as the first parser", function () {
            var p = P.skip(P.word("!"));
            var q = P.word("?");

            var result = P.separated_by(p, q)(P.prepare("!"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual([]);
            expect(result.state.pos).toEqual(1);

            result = P.separated_by(p, q)(P.prepare("!?!"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["?"]);
            expect(result.state.pos).toEqual(3);
        });

        it("plays nicely with separated_by as the second parser", function () {
            var p = P.word("!");
            var q = P.skip(P.word("?"));

            var result = P.separated_by(p, q)(P.prepare("!"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["!"]);
            expect(result.state.pos).toEqual(1);

            result = P.separated_by(p, q)(P.prepare("!?!"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["!", "!"]);
            expect(result.state.pos).toEqual(3);
        });

        it("plays nicely with option when matching one time", function () {
            var p = P.skip(P.word("test"));

            var result = P.option(p)(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(4);
        });

        it("plays nicely with option when matching zero times", function () {
            var p = P.skip(P.word("x"));

            var result = P.option(p)(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("plays nicely with peek on success", function () {
            var result = P.skip(P.peek(P.word("test")))(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);            
        });

        it("plays nicely with peek on failure", function () {
            var result = P.skip(P.peek(P.word("x")))(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);            
        });
    });

    describe("separated_by", function () {
        it("fails on zero repetitions", function () {
            var p = P.word("!");
            var q = P.word("?");

            var result = P.separated_by(p, q)(P.prepare("x"));

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("matches one repetition", function () {
            var p = P.word("!");
            var q = P.word("?");

            var result = P.separated_by(p, q)(P.prepare("!"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["!"]);
            expect(result.state.pos).toEqual(1);
        });

        it("matches two repetitions", function () {
            var p = P.word("!");
            var q = P.word("?");

            var result = P.separated_by(p, q)(P.prepare("!?!"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["!", "?", "!"]);
            expect(result.state.pos).toEqual(3);
        });

        it("matches many repetitions", function () {
            var p = P.word("!");
            var q = P.word("?");

            var result = P.separated_by(p, q)(P.prepare("!?!?!"));

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual(["!", "?", "!", "?", "!"]);
            expect(result.state.pos).toEqual(5);
        });
    });

    describe("option", function () {
        it("matches zero times", function () {
            var p = P.word("x");

            var result = P.option(p)(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("matches one time", function () {
            var p = P.word("test");

            var result = P.option(p)(state);
            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("test");
            expect(result.state.pos).toEqual(4);
        });
    });

    describe("peek", function () {
        it("consumes no input on success", function () {
            var result = P.peek(P.word("test"))(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("test");
            expect(result.state.pos).toEqual(0);
        });

        it("can fail", function () {
            var result = P.peek(P.word("x"))(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });
    });

    describe("not", function () {
        it("fails on a match", function () {
            var result = P.not(P.word("test"))(state);

            expect(result.success).toBeFalsy();
            expect(result.result.has_value).toBeFalsy();
            expect(result.state.pos).toEqual(0);
        });

        it("succeeds on no match", function () {
            var result = P.not(P.word("x"))(state);

            expect(result.success).toBeTruthy();
            expect(result.result.has_value).toBeTruthy();
            expect(result.result.value).toEqual("t");
            expect(result.state.pos).toEqual(1);
        });
    });

    describe("lift", function () {
        it("satisfies its type signature", function () {
            var p = P.word("test");

            var f = P.lift(function (str) {
                return 8;
            });

            var success = f(p)(state);
            expect(success.success).toBeTruthy();
            expect(success.result.has_value).toBeTruthy();
            expect(success.result.value).toEqual(8);
            expect(success.state.pos).toEqual(4);

            var failure = f(p)(P.prepare("x"));
            expect(failure.success).toBeFalsy();
            expect(failure.result.has_value).toBeFalsy();
            expect(failure.state.pos).toEqual(0);
        });
    });
});

/* Keep JSLint happy */
/*global describe it beforeEach expect
/* P */
