"use strict";
$(document).ready(function () {
    $("div[tabindex='1']").focus();
    Cursor.init();

    var pressedKeys = {};

    $('div#body').on('keyup', 'div', function (event) {
        pressedKeys[event.keyCode] = false;
    });
    $('div#body').on('keydown', 'div', function (event) {
        pressedKeys[event.keyCode] = true;
        console.log('keydown' + event.keyCode);

        if (event.keyCode === 13) { // enter key
            Cursor.addNewRow();
            event.preventDefault();
        }
        else if (event.keyCode === 9) { // tab key
            if ($('#active-autocomplete').length) {
                var insertedText = $('#active-autocomplete').find('#autocomplete-postfix').text();
                for (var i = 0; i < insertedText.length; i++) {
                    Cursor.putSymbol(insertedText[i]);
                }
                AutoComplete.hide();
            }
            else {
                Cursor.putSymbol(' ');
                Cursor.putSymbol(' ');
                Cursor.putSymbol(' ');
                Cursor.putSymbol(' ');
            }
            event.preventDefault();
        }
        else if (event.keyCode === 38) { // up arrow
            if ($('.autocomplete').length) {
                AutoComplete.hlPrev();
            }
            else {
                Cursor.upRow();
            }
            event.preventDefault();
        }
        else if (event.keyCode === 40) { // down arrow
            if ($('.autocomplete').length) {
                AutoComplete.hlNext();
            }
            else {
                Cursor.downRow();
            }
            event.preventDefault();
        }
        else if (event.keyCode === 16) {
        }
        else if (event.keyCode === 32) { // space
            Cursor.putSymbol(event.key);
            var cloneElement = $(event.target).clone();
            var cursor = cloneElement.find('.cursor');
            if (cursor.attr('id') === "to-remove") {
                cursor.replaceWith($(document.createTextNode('')));
            }
            var codeString = cloneElement.text();
            $.ajax({
                method: "POST",
                url: window.location,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    "code_string": codeString,
                    "code_line_number": parseInt(event.target.getAttribute('tabIndex')),
                    "type": "parse"
                })
            }).done(function (response) {
                var $newElement = $(response.code_string);
                $(event.target).replaceWith($newElement);
                // если починить ссе баги на курсор то можно будет тернарный опереатор убрать
                Cursor._setCursorShift(Cursor.position <= $newElement.text().length ? Cursor.position : $newElement.text().length, $newElement);
                $newElement.focus();
            }).fail(function () {
                console.log('все сломалось')
            });

            event.preventDefault();
        }
        else if (event.keyCode === 33) { // PageUP
            Cursor.pageUp();
            event.preventDefault();
        }
        else if (event.keyCode === 34) { // PageDown
            Cursor.pageDown();
            event.preventDefault();
        }
        else if (event.keyCode === 35) { // end
            Cursor.moveEnd();
            event.preventDefault();
        }
        else if (event.keyCode === 36) { // home
            Cursor.moveHome();
            event.preventDefault();
        }
        else if (event.keyCode === 37) { // row left
            Cursor.moveLeft();
            event.preventDefault();
        }
        else if (event.keyCode === 39) { // row rigth
            Cursor.moveRight();
            event.preventDefault();
        }
        else if (event.keyCode === 16) {  // shift
        }
        else if (event.keyCode === 17) {  // ctrl
        }
        else if (event.keyCode === 18) {  // alt
        }
        else if (event.keyCode === 116) {  // F5
        }
        else if (event.keyCode === 8) { // backspace
            Cursor.deleteSymbolBefore();
            AutoComplete.show();
            event.preventDefault();
        }
        else if (event.keyCode === 46) { // delete
            Cursor.deleteSymbolUnder();
            event.preventDefault();
        }
        else {
            Cursor.putSymbol(event.key);
            AutoComplete.show();
            event.preventDefault();
        }
    });

    // TODO move to one selector
    $('div#body').on('click', 'div', function () {
        Cursor.setByClick();
        AutoComplete.hide();
        if (pressedKeys['17']) {
            $.ajax({
                method: "POST",
                url: window.location,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    "code_string": $($(document.getElementsByClassName('cursor')[0]).parents('.content-line')[0]).text(),
                    "cursor_position": Cursor._getCursorPosition()['cursorPosition'],
                    "code_line_number": parseInt($(document.getElementsByClassName('cursor')[0]).parents('.content-line')[0].getAttribute('tabIndex')),
                    "type": "gotodefinition"
                })
            }).done(function (response) {
                var contentLIne = document.querySelector('[tabindex="' + parseInt(response.code_line_number) + '"]');
                contentLIne.scrollIntoView(true);
                Cursor._setCursorShift(1, contentLIne);
            }).fail(function () {
                console.log('все сломалось в го ту дефинишин')
            });
        }
    });
    $(window).scroll(function () {
        AutoComplete.hide();
    });


    $(".filelink").click(
        function (event) {
            console.log(event.target.attributes['href'].value);
            console.log(window.top.frames[0]);
            window.top.frames[0].location = event.target.attributes['href'].value;
            event.preventDefault()
        }
    );

    $(".folderlink").click(
        function (event) {
            event.preventDefault()
        }
    );
});
