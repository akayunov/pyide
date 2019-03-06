import {LineNumber} from './linenumber';
import {AutoComplete} from './autocomplete/autocomplete';
import {FileListing} from './filelisting';
import {TxtCursor} from './cursors/txt';
import {PyCursor} from './cursors/py';
import {Tags} from './tags/tags';
import {Code} from './code';
 

interface KeyCodes {
  [index: string]: boolean;
}
class Main {
    public code;
    public cursor;
    public tags;
    public fileListing;
    public autoComplete;
    public lineNumber;
    constructor() {
        let self = this;
    document.addEventListener('DOMContentLoaded', function() {
        self.code = new Code();

        self.cursor = new TxtCursor(self.code);

        self.tags = new Tags();

        self.fileListing = new FileListing(self.code);

        self.autoComplete = new AutoComplete();

        self.lineNumber = new LineNumber(1);

        let pressedKeys: KeyCodes = {};

        document.getElementById('code').addEventListener('keyup', function (event: KeyboardEvent) {
            pressedKeys[event.keyCode] = false;
            event.preventDefault();
        });



        document.getElementById('code').addEventListener('click', function (event) {
            self.cursor.setByClick();
            self.autoComplete.hide();
            if (pressedKeys['17']) {
                self.cursor.goToDefinition(self.fileListing.curentFile)
            }
            event.preventDefault();
        });

        document.getElementById('filelisting').addEventListener('click', function (event) {
            const target: HTMLElement = event.target as HTMLElement;
            if (target.parentElement.className === 'filelink'){

                let lineCount = self.fileListing.showFile(event);
                // should count multi line string like ''' '''
                self.lineNumber.adjust(lineCount);
                // tags.init(event);
                if (target.attributes['href'].value.endsWith('.py')) {
                    self.code = new Code();
                    self.code.getFirstLine();
                    self.cursor = new PyCursor(self.code);
                }
                else {
                    self.code = new Code();
                    self.cursor = new TxtCursor(self.code);
                }
            }
            else if (target.parentElement.className === 'folderlink'){
                self.fileListing.get(event);
            }

            event.preventDefault();
        });

        document.getElementById('code').addEventListener('keydown', function (event) {
            pressedKeys[event.keyCode] = true;

            if (event.keyCode === 13) { // enter key
                self.cursor.addNewRow();
                event.preventDefault();
            }
            else if (event.keyCode === 9) { // tab key
                if ( document.getElementById('active-autocomplete')) {
                    const activeAutoComplete = document.getElementById('active-autocomplete');
                    let insertedText = activeAutoComplete.children[1].textContent;
                    if (insertedText){
                        for (let i = 0; i < insertedText.length; i++) {
                            self.cursor.putSymbol(insertedText[i]);
                        }
                        self.autoComplete.hide();
                    }
                    else{
                        console.log('insertedText is empty in  main')
                    }
                }
                else {
                    self.cursor.putTab();
                }
                event.preventDefault();
            }
            else if (event.keyCode === 38) { // up arrow
                if (document.getElementsByClassName('autocomplete').length) {
                    self.autoComplete.hlPrev();
                }
                else {
                    self.cursor.moveUpRow();
                }
                event.preventDefault();
            }
            else if (event.keyCode === 40) { // down arrow
                if (document.getElementsByClassName('autocomplete').length) {
                    self.autoComplete.hlNext();
                }
                else {
                    self.cursor.moveDownRow();
                }
                event.preventDefault();
            }
            else if (event.keyCode === 16) {
            }
            else if (event.keyCode === 32) { // space
                self.cursor.putSymbol(event.key);
                self.autoComplete.hide();
                self.cursor.lineParse(event, self.fileListing.curentFile);
                event.preventDefault();
            }
            else if (event.keyCode === 33) { // PageUP
                self.cursor.pageUp();
                event.preventDefault();
            }
            else if (event.keyCode === 34) { // PageDown
                self.cursor.pageDown();
                event.preventDefault();
            }
            else if (event.keyCode === 35) { // end
                self.cursor.moveEnd();
                event.preventDefault();
            }
            else if (event.keyCode === 36) { // home
                self.cursor.moveHome();
                event.preventDefault();
            }
            else if (event.keyCode === 37) { // row left
                self.cursor.moveLeft();
                event.preventDefault();
            }
            else if (event.keyCode === 39) { // row rigth
                self.cursor.moveRight();
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
                self.cursor.deleteSymbolBefore();
                // autoComlete.show(cursor._getCursorPosition(), fileListing.curentFile);
                event.preventDefault();
            }
            else if (event.keyCode === 46) { // delete
                self.cursor.deleteSymbolUnder();
                event.preventDefault();
            }
            else {
                self.cursor.putSymbol(event.key);
                // autoComlete.show(cursor._getCursorPosition(), fileListing.curentFile);
                event.preventDefault();
            }
        })
    })

}

}
new Main();