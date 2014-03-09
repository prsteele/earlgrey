var earldoc = (function () {
    var start_comment = P.word("/**");
    var end_comment = P.word("*/");
    var star = P.word("*");
    var not_star = P.none_of("*");
    var slash = P.word("/");
    var not_slash = P.none_of("/");
    var star_not_end_comment = P.plus(star, P.skip(P.peek(not_slash)));
    var slash_not_start_comment = P.plus(slash, P.skip(P.peek(not_star)));

    var comment = P.plus(P.skip(start_comment),
                         P.many(P.or(not_star, star_not_end_comment)),
                         P.skip(end_comment));

    var not_comment = P.many1(P.or(not_slash, slash_not_start_comment));

    var comments = P.plus(P.skip(P.maybe(not_comment)),
                          P.maybe(P.separated_by(comment, not_comment)),
                          P.skip(P.maybe(not_comment)));

    var parse = function (text) {
        var b = new P.Body("TestJS", text);
        var s = new P.State(b);

        var result = comments(s);

        if (result.success) {
            return result.result.join("");
        }

        return result;
    };

    return parse;
})();

/*global P*/
