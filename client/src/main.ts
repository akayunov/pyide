import {LineNumber} from './line-number';
import {PyAutocomplete} from './autocomplete/py-autocomplete';
import {TxtAutocomplete} from './autocomplete/txt-autocomplete';
import {FileListing} from './file-listing';
import {TxtCursor} from './cursors/txt-cursor';
import {PyCursor} from './cursors/py-cursor';
import {Tags} from './tags/tags';
import {Code} from './code';
import {CommandBus} from './command-bus';
import {CommandHandlers} from './command';
import {EventQueue} from './event-queue';


interface KeyCodes {
    [index: string]: boolean;
}

interface LineParse {
    type: string;
    data: {
        lineNumber: number;
        lineElements: Array<string>;
        fileName: string;
        lineText: string;
    }
}

interface AutocompleteShow {
    type: string;
    data: {
        lineNumber: number;
        variants: Array<string>;
        fileName: string;
        lineText: string;
        positionInLine: number
        result: Array<string>;
        prefix: Array<string>;
    }
}

class Main extends CommandHandlers {
    public code: Code;
    public cursor: TxtCursor;
    public tags: Tags;
    public fileListing: FileListing;
    public autoComplete: TxtAutocomplete;
    public lineNumber: LineNumber;
    public pressedKeys: KeyCodes;
    private readonly serverUrl: string;
    private commandBus: CommandBus;
    private eventQueue: EventQueue;

    constructor() {
        super();
        //TODO change firefox-> about:config  -> network.websocket.allowInsecureFromHTTPS to false
        this.serverUrl = 'ws://' + window.location.host + '/server/command';
        let self = this;
        self.eventQueue = new EventQueue();

        document.addEventListener('DOMContentLoaded', function () {
            self.lineNumber = new LineNumber(1);
            self.code = new Code('', self.lineNumber, self.eventQueue);

            self.tags = new Tags();

            self.fileListing = new FileListing();

            self.autoComplete = new TxtAutocomplete();



            self.cursor = new TxtCursor(self.code, self.lineNumber, self.eventQueue);

            self.pressedKeys = {};
            // self.commandBus = new CommandBus(self.serverUrl);

            self.setKeyBoardEventListeners();
            self.setMouseEventListeners();

            self.eventQueue.addHandler(['lineChange', 'lineAdd', 'lineRemove', ], self.handlerLineParse.bind(self));
            self.eventQueue.addHandler(['autocomplete'], self.handlerAutocompleteShow.bind(self));
        })
    }

    handlerLineParse(jsonData: LineParse) {
        // console.log('jsonData.data.fileName', jsonData.data, jsonData.data.fileName);
        //TODO file can parsed in background then you have many code objects
        if (this.code.fileName !== jsonData.data.fileName) {
            return;
        }
        let line = this.code.getLineByNumber(jsonData.data.lineNumber);
        if (jsonData.data.lineText !== line.textContent){
            return;
        }
        let currentLineNumber = this.cursor.getLineNumber();
        if (jsonData.data.lineNumber === currentLineNumber){
            // cursor in this line so should be saved
            let oldPosition = this.code.getPositionInLine(this.cursor.cursorParentElement, this.cursor.getPositionInNode());

            //TODO optimize, how? // TODO performance tests
            // console.log(`text before|${line.textContent}|` );
            // console.log(`text after parsing|${jsonData.data.lineElements}|`);
            if (jsonData.data.lineElements.length > 0){
                Array.from(line.childNodes).forEach(x => {x.remove()});
                Array.from(jsonData.data.lineElements).forEach(x => {
                    let span = document.createElement('span');
                    line.appendChild(span);
                    span.outerHTML = x;
                });
            }

            // TODO in case line removal tabIndex will be the same on another line
            let newPosition = this.code.getNodeByPosition(line, oldPosition);
            this.cursor.putCursorByPositionInNode(newPosition.node, newPosition.positionInNode);
        }
        else{
            //TODO optimize, how? // TODO performance tests
            Array.from(line.childNodes).forEach(x => {x.remove()});
            Array.from(jsonData.data.lineElements).forEach(x => {
                let span = document.createElement('span');
                line.appendChild(span);
                span.outerHTML = x;
            });
        }
    }

    handlerAutocompleteShow(jsonData: AutocompleteShow) {
        if (jsonData.data.result.length > 0) {
            this.autoComplete.refill(jsonData.data.result, this.cursor.getPreviousText(),this.cursor.getCoordinate(), this.lineNumber.getByNumber(jsonData.data.lineNumber));
        }
    }

    async handlerGoToDefinition(){
        let response = await fetch(
            `/server/file/gotodefinition/${this.fileListing.currentFileName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        code_string: this.code.getLineByNumber(this.cursor.getLineNumber()).textContent,
                        cursor_position: this.code.getPositionInLine(this.cursor.cursorParentElement, this.cursor.getPositionInNode()),
                        code_line_number: this.cursor.getLineNumber(),
                        type: 'gotodefinition'
                    }
                )
            }
        );
        if (response.ok){
            let data = await response.json();
            console.log(`Go to definition: ${data.code_line_number}, ${data.cursor_position}`);
            let contentLine = this.code.getLineByNumber(data.code_line_number);
            contentLine.scrollIntoView(true);
            this.cursor.putCursorByPositionInNode(this.code.getNodeByPosition(contentLine, data.cursor_position).node, 0);
        }
        else{
            console.log(`Go to definition is failed, server say: ${response.status}, ${response.statusText}`);
        }
    }

    setKeyBoardEventListeners() {
        let self = this;
        document.getElementById('lines').addEventListener('keyup', function (event: KeyboardEvent) {
            self.pressedKeys[event.code] = false;
            event.preventDefault();
        });

        document.getElementById('lines').addEventListener('keydown', async function (event) {
            self.pressedKeys[event.code] = true;
            console.log('code', event.code);
            if (event.code === 'Enter') {
                self.cursor.addNewRow();
                event.preventDefault();
            } else if (event.code === 'Tab') {
                if (self.autoComplete.active) {
                    self.cursor.putString(self.autoComplete.getSymbols(self.cursor.getPreviousText()));
                    self.autoComplete.hide();
                } else {
                    self.cursor.putTab();
                }
                event.preventDefault();
            } else if (event.code === 'ArrowUp') {
                if (self.autoComplete.active) {
                    self.autoComplete.hlPrev();
                } else {
                    self.cursor.moveUpRow();
                }
                event.preventDefault();
            } else if (event.code === 'ArrowDown') {
                if (self.autoComplete.active) {
                    self.autoComplete.hlNext();
                } else {
                    self.cursor.moveDownRow();
                }
                event.preventDefault();
            } else if (event.code === 'Space') {
                self.cursor.putSymbol(event.key);
                self.autoComplete.hide();
                event.preventDefault();
            } else if (event.code === 'PageUp') {
                self.cursor.pageUp();
                event.preventDefault();
            } else if (event.code === 'PageDown') {
                self.cursor.pageDown();
                event.preventDefault();
            } else if (event.code === 'End') {
                self.cursor.moveEnd();
                event.preventDefault();
            } else if (event.code === 'ShiftLeft') {
            } else if (event.code === 'ShiftRight') {
            } else if (event.code === 'Home') {
                self.cursor.moveHome();
                event.preventDefault();
            } else if (event.code === 'ArrowLeft') {
                self.cursor.moveLeft();
                self.autoComplete.hide();
                event.preventDefault();
            } else if (event.code === 'ArrowRight') {
                self.cursor.moveRight();
                self.autoComplete.hide();
                event.preventDefault();
            } else if (event.code === 'ShiftLeft') {
            } else if (event.code === 'ControlLeft') {
            } else if (event.code === 'AltLeft') {
            } else if (event.code === 'F5') {
            } else if (event.code === 'Backspace') {
                self.cursor.backspace();
                self.eventQueue.push({
                    'type': 'autocomplete',
                    'id': 'Main.autocomplete.backspace',
                    'data': {
                        'fileName': self.code.fileName,
                        'lineText': self.cursor.cursorParentElement.parentElement.textContent,
                        'positionInLine': self.code.getPositionInLine(self.cursor.cursorParentElement, self.cursor.getPositionInNode()),
                        'lineNumber': parseInt(self.cursor.cursorParentElement.parentElement.getAttribute('tabIndex'))
                    }
                });
                event.preventDefault();
            } else if (event.code === 'Delete') {
                self.cursor.delete();
                event.preventDefault();
            } else if (event.code === 'KeyS' && self.pressedKeys['ControlLeft']) {
                event.preventDefault();
                await self.code.save();
            }
            else {
                self.cursor.putSymbol(event.key);
                self.eventQueue.push({
                    'type': 'autocomplete',
                    'id': 'Main.autocomplete.putsymbol',
                    'data': {
                        'fileName': self.code.fileName,
                        'lineText': self.cursor.cursorParentElement.parentElement.textContent,
                        'positionInLine': self.code.getPositionInLine(self.cursor.cursorParentElement, self.cursor.getPositionInNode()),
                        'lineNumber': parseInt(self.cursor.cursorParentElement.parentElement.getAttribute('tabIndex'))
                    }
                });
                event.preventDefault();
            }
        })
    }

    setMouseEventListeners() {
        let self = this;
        document.getElementById('lines').addEventListener('click', async function (event) {
            event.preventDefault();
            self.cursor.setByClick();
            self.autoComplete.hide();
            if (self.pressedKeys['ControlLeft']) {
                await self.handlerGoToDefinition();
            }
        });

        document.getElementById('filelisting').addEventListener('click', async function (event) {
            event.preventDefault();
            const target: HTMLElement = event.target as HTMLElement;
            console.log('filelinf target:', target);
            if (target.parentElement.className === 'filelink') {
                let lines = await self.fileListing.showFile(target.getAttribute('href'));
                // TODO should count multi line string like ''' '''
                self.lineNumber.adjust(lines.length === 0 ? 1 : lines.length);
                await self.tags.init(self.fileListing.currentFileName);
                let fileName = target.parentElement.getAttribute('path');
                self.cursor.clean();
                self.code.clean();
                if (fileName.endsWith('.py')) {
                    self.code = new Code(fileName, self.lineNumber, self.eventQueue, lines);
                    self.cursor = new PyCursor(self.code, self.lineNumber, self.eventQueue);
                    self.autoComplete = new PyAutocomplete();
                } else {
                    self.code = new Code(fileName, self.lineNumber, self.eventQueue, lines);
                    self.cursor = new TxtCursor(self.code, self.lineNumber, self.eventQueue);
                    self.autoComplete = new TxtAutocomplete();
                }
            } else if (target.parentElement.className === 'folderlink') {
                await self.fileListing.get(event);
            }
            if (self.autoComplete.active) {
                self.autoComplete.hide()
            }
        });
    }
}

new Main();
