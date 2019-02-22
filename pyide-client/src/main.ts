import {LineNumber} from './linenumber';
import {AutoComplete} from './autocomplete/autocomplete';
import {FileListing} from './filelisting';
import {TxtCursor} from './cursors/txt';
import {PyCursor} from './cursors/py';
import {Tags} from './tags/tags';
 

interface KeyCodes {
  [index: string]: boolean;
}
document.addEventListener('DOMContentLoaded', function() {
    let cursor = new TxtCursor();

    let tags = new Tags();

    let fileListing = new FileListing();

    let autoComlete = new AutoComplete();

    let lineNumber = new LineNumber(1);

    let pressedKeys: KeyCodes = {};

    document.getElementById('code').addEventListener('keyup', function (event: KeyboardEvent) {
        pressedKeys[event.keyCode] = false;
        event.preventDefault();
    });



    document.getElementById('code').addEventListener('click', function (event) {
        cursor.setByClick();
        autoComlete.hide();
        if (pressedKeys['17']) {
            cursor.goToDefinition(fileListing.curentFile)
        }
        event.preventDefault();
    });

    document.getElementById('filelisting').addEventListener('click', function (event) {
      const target: HTMLElement = event.target as HTMLElement;
        if (target.parentElement.className === 'filelink'){
            let lineCount = fileListing.showFile(event);
            // should count multi line string like ''' '''
            lineNumber.adjust(lineCount);
            tags.init(event);
            if (target.attributes['href'].value.endsWith('.py')) {
                cursor = new PyCursor();
            }
            else {
                cursor = new TxtCursor();
            }
        }
        else if (target.parentElement.className === 'folderlink'){
            fileListing.get(event);
        }

        event.preventDefault();
    });

    document.getElementById('code').addEventListener('keydown', function (event) {
        pressedKeys[event.keyCode] = true;

        if (event.keyCode === 13) { // enter key
            cursor.addNewRow();
            event.preventDefault();
        }
        else if (event.keyCode === 9) { // tab key
            if ( document.getElementById('active-autocomplete')) {
                const activeAutoComplete = document.getElementById('active-autocomplete');
                let insertedText = activeAutoComplete.children[1].textContent;
                if (insertedText){
                    for (let i = 0; i < insertedText.length; i++) {
                        cursor.putSymbol(insertedText[i]);
                    }
                    autoComlete.hide();
                }
                else{
                    console.log('insertedText is empty in  main')
                }
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
    })
});
