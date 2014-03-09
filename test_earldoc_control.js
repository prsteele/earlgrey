(function () {
    var input_area = document.getElementById("code");
    var parse_button = document.getElementById("parse");
    var result_area = document.getElementById("result");

    var f = function () {
        var text = input_area.value;
        var result = parse(text);
        result_area.innerHTML = result;
    };

    parse_button.onclick = f;
})();

/*global parse*/
