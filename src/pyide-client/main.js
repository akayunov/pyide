;"use strict";
$(document).ready(function () {
    $("div[tabindex='1']").focus();
    let cursor = new TxtCursor();
    cursor.init();

    let tags = new Tags();
    let fileListing = new FileListing();
    fileListing.init();

    let autoComlete = new AutoComplete();
    let pressedKeys = {};

    $('div#code').on('keyup', 'div', function (event) {
        pressedKeys[event.keyCode] = false;
    });
    $('div#code').on('keydown', 'div', function (event) {
        pressedKeys[event.keyCode] = true;
        console.log('keydown' + event.keyCode);

        if (event.keyCode === 13) { // enter key
            cursor.addNewRow();
            event.preventDefault();
        }
        else if (event.keyCode === 9) { // tab key
            if ($('#active-autocomplete').length) {
                let insertedText = $('#active-autocomplete').find('#autocomplete-postfix').text();
                for (let i = 0; i < insertedText.length; i++) {
                    cursor.putSymbol(insertedText[i]);
                }
                autoComlete.hide();
            }
            else {
                cursor.putTab();
            }
            event.preventDefault();
        }
        else if (event.keyCode === 38) { // up arrow
            if ($('.autocomplete').length) {
                autoComlete.hlPrev();
            }
            else {
                cursor.upRow();
            }
            event.preventDefault();
        }
        else if (event.keyCode === 40) { // down arrow
            if ($('.autocomplete').length) {
                autoComlete.hlNext();
            }
            else {
                cursor.downRow();
            }
            event.preventDefault();
        }
        else if (event.keyCode === 16) {
        }
        else if (event.keyCode === 32) { // space
            cursor.putSymbol(event.key);
            autoComlete.hide();
            let cloneElement = $(event.target).clone();
            let cursorEl = cloneElement.find('.cursor');
            if (cursorEl.attr('id') === "to-remove") {
                cursorEl.replaceWith($(document.createTextNode('')));
            }
            let codeString = cloneElement.text();
            $.ajax({
                method: "POST",
                url: FileListing.curentFile,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    "code_string": codeString,
                    "code_line_number": parseInt(event.target.getAttribute('tabIndex')),
                    "type": "parse"
                })
            }).done(function (response) {
                let $newElement = $(response.code_string[0]);
                $(event.target).replaceWith($newElement);
                // если починить ссе баги на курсор то можно будет тернарный опереатор убрать
                cursor._setCursorShift(cursor.position <= $newElement.text().length ? cursor.position : $newElement.text().length, $newElement);
                $newElement.focus();
            }).fail(function () {
                console.log('все сломалось')
            });

            event.preventDefault();
        }
        else if (event.keyCode === 33) { // PageUP
            cursor.pageUp();
            event.preventDefault();
        }
        else if (event.keyCode === 34) { // PageDown
            cursor.pageDown();
            event.preventDefault();
        }
        else if (event.keyCode === 35) { // end
            cursor.moveEnd();
            event.preventDefault();
        }
        else if (event.keyCode === 36) { // home
            cursor.moveHome();
            event.preventDefault();
        }
        else if (event.keyCode === 37) { // row left
            cursor.moveLeft();
            event.preventDefault();
        }
        else if (event.keyCode === 39) { // row rigth
            cursor.moveRight();
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
            cursor.deleteSymbolBefore();
            autoComlete.show(cursor._getCursorPosition(), fileListing.curentFile);
            event.preventDefault();
        }
        else if (event.keyCode === 46) { // delete
            cursor.deleteSymbolUnder();
            event.preventDefault();
        }
        else {
            cursor.putSymbol(event.key);
            autoComlete.show(cursor._getCursorPosition(), fileListing.curentFile);
            event.preventDefault();
        }
    });

    // TODO move to one selector
    $('div#code').on('click', 'div', function () {
        cursor.setByClick();
        autoComlete.hide();
        if (pressedKeys['17']) {
            $.ajax({
                method: "POST",
                url: fileListing.curentFile,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    "code_string": $($(document.getElementsByClassName('cursor')[0]).parents('.content-line')[0]).text(),
                    "cursor_position": cursor._getCursorPosition()['cursorPosition'],
                    "code_line_number": parseInt($(document.getElementsByClassName('cursor')[0]).parents('.content-line')[0].getAttribute('tabIndex')),
                    "type": "gotodefinition"
                })
            }).done(function (response) {
                let contentLIne = document.querySelector('[tabindex="' + parseInt(response.code_line_number) + '"]');
                contentLIne.scrollIntoView(true);
                cursor._setCursorShift(response.cursor_position + 1, contentLIne);
            }).fail(function () {
                console.log('все сломалось в го ту дефинишин')
            });
        }
    });
    $(window).scroll(function () {
        autoComlete.hide();
    });

    $('#filelisting').on('click', '.filelink',
        function (event) {
            console.log(event.target.attributes['href'].value);
            // show file
            $.ajax({
                method: "GET",
                url: event.target.attributes['href'].value,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            }).done(function (response) {
                Array.from(document.getElementById('code').children).forEach(
                    function (element){
                        element.remove()
                    }
                );
                response.forEach(
                    function(element){
                        document.getElementById('code').appendChild($(element)[0])
                    }
                );
                cursor._setCursorShift(1, document.querySelector('[tabindex="1"]'));
                document.querySelector('[tabindex="1"]').focus();
                fileListing.curentFile = event.target.attributes['href'].value;
            }).fail(function (jqXHR, textStatus) {
                console.log('все сломалось в get CODE' , jqXHR, textStatus)
            });
            event.preventDefault();
            tags.init(event);
            if (event.target.attributes['href'].value.endsWith('.py')){
                cursor = new PyCursor();
            }
            else {
                cursor = new TxtCursor();
            }
        }
    );

    $('#filelisting').on('click', '.folderlink',
        function (event) {
            fileListing.get(event)
        }
    );
});
