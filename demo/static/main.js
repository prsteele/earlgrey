(function () {
    var input_button = document.querySelector("#source-submit");
    
    input_button.onclick = function () {
        var input = document.querySelector("#source");
        var input_text = input.value;
        
        var output = document.querySelector("#result");
        output.value = earldoc.parse(input_text);
    };
})();

/*global earldoc*/
