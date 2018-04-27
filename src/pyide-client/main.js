;"use strict";
document.addEventListener('DOMContentLoaded', function() {
    let cursor = new TxtCursor();

    let tags = new Tags();

    let fileListing = new FileListing();

    let autoComlete = new AutoComplete();

    let lineNumber = new LineNumber(1);

    let pressedKeys = {};

    document.getElementById('code').onkeyup = function (event) {
        pressedKeys[event.keyCode] = false;
        event.preventDefault();
    };


    document.getElementById('code').onclick = function (event) {
        cursor.setByClick();
        autoComlete.hide();
        if (pressedKeys['17']) {
            cursor.goToDefinition(fileListing.curentFile)
        }
        event.preventDefault();
    };

    document.getElementById('filelisting').onclick = function (event) {
        if (event.target.parentElement.className === 'filelink'){
            let lineCount = fileListing.showFile(event);
            // should count multi line string
            console.log('NEW LINE', lineCount);
            lineNumber.adjust(lineCount);
            tags.init(event);
            if (event.target.attributes['href'].value.endsWith('.py')) {
                cursor = new PyCursor();
            }
            else {
                cursor = new TxtCursor();
            }
        }
        else if (event.target.parentElement.className === 'folderlink'){
            fileListing.get(event);
        }

        event.preventDefault();
    };

    document.getElementById('code').onkeydown = function (event) {
        pressedKeys[event.keyCode] = true;

        if (event.keyCode === 13) { // enter key
            cursor.addNewRow();
            event.preventDefault();
        }
        else if (event.keyCode === 9) { // tab key
            if ( document.getElementById('active-autocomplete')) {
                let insertedText = document.getElementById('active-autocomplete').children[1].textContent;
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
            if (document.getElementsByClassName('autocomplete').length) {
                autoComlete.hlPrev();
            }
            else {
                cursor.upRow();
            }
            event.preventDefault();
        }
        else if (event.keyCode === 40) { // down arrow
            if (document.getElementsByClassName('autocomplete').length) {
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
            cursor.lineParse(event, fileListing.curentFile);
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
    };
});
