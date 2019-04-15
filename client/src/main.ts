import {LineNumber} from './line-number';
import {PyAutocomplete} from './autocomplete/py-autocomplete';
import {TxtAutocomplete} from "./autocomplete/txt-autocomplete";
import {FileListing} from './file-listing';
import {TxtCursor} from './cursors/txt-cursor';
import {PyCursor} from './cursors/py-cursor';
import {Tags} from './tags/tags';
import {Code} from './code';
import {CommandBus} from './command-bus';
import {CommandHandlers} from './command';


interface KeyCodes {
    [index: string]: boolean;
}

interface LineParse {
    type: string;
    data: {
        lineNumber: number;
        lineElements: Array<string>;
        fileName: string;
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

    constructor() {
        super();
        //TODO change firefox-> about:config  -> network.websocket.allowInsecureFromHTTPS to false
        this.serverUrl = "ws://" + window.location.host + "/server/command";
        let self = this;
        document.addEventListener('DOMContentLoaded', function () {
            self.lineNumber = new LineNumber(1);
            self.code = new Code('', self.lineNumber);

            self.tags = new Tags();

            self.fileListing = new FileListing();

            self.autoComplete = new TxtAutocomplete();



            self.cursor = new TxtCursor(self.code, self.lineNumber);

            self.pressedKeys = {};
            self.commandBus = new CommandBus(self.serverUrl);

            self.setKeyBoardEventListeners();
            self.setMouseEventListeners();

            self.registerCommandHandler("lineParse", (x: LineParse) => {
                self.handlerLineParse(x)
            });
            self.registerCommandHandler("autoCompleteShow", (x: AutocompleteShow) => {
                self.handlerAutocompleteShow(x)
            });
        })
    }

    handlerLineParse(jsonData: LineParse) {
        // console.log('jsonData.data.fileName', jsonData.data, jsonData.data.fileName);
        //TODO need to add lock to avoid race condition with typing
        if (this.code.fileName !== jsonData.data.fileName) {
            return;
        }
        let line = this.code.getLineByNumber(jsonData.data.lineNumber);
        let currentLineNumber = this.cursor.getLineNumber();
        let oldPosition = this.code.getPositionInLine(this.cursor.cursorParentElement, this.cursor.getPositionInNode());

        this.code.replaceLine(jsonData.data.lineNumber, jsonData.data.lineElements, this.cursor);
        // TODO in case line removal tabIndex will be the same on another line
        if (parseInt(currentLineNumber) === jsonData.data.lineNumber) {
            let newPosition = this.code.getNodeByPosition(line, oldPosition);
            this.cursor.putCursorByPositionInNode(newPosition.node, newPosition.positionInNode);
        }
    }

    handlerAutocompleteShow(jsonData: AutocompleteShow) {
        this.autoComplete.refill(jsonData.data.result);
        this.autoComplete.show(this.cursor.getCoordinate(),this.lineNumber.getByNumber(jsonData.data.lineNumber));
    }

    setKeyBoardEventListeners() {
        let self = this;
        document.getElementById('lines').addEventListener('keyup', function (event: KeyboardEvent) {
            self.pressedKeys[event.code] = false;
            event.preventDefault();
        });

        document.getElementById('lines').addEventListener('keydown', function (event) {
            self.pressedKeys[event.code] = true;
            // console.log('code', event.code);
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
                self.commandBus.sendCommand('autoCompleteShow',
                    self.autoComplete.commandGetAutocompleteShow(
                        self.cursor.cursorParentElement.parentElement,
                        self.code.getPositionInLine(self.cursor.cursorParentElement, self.cursor.getPositionInNode()),
                        self.code.fileName
                    )
                );
                event.preventDefault();
            } else if (event.code === 'Delete') {
                self.cursor.delete();
                event.preventDefault();
            } else {
                self.cursor.putSymbol(event.key);
                self.commandBus.sendCommand('autoCompleteShow',
                    self.autoComplete.commandGetAutocompleteShow(
                        self.cursor.cursorParentElement.parentElement,
                        self.code.getPositionInLine(self.cursor.cursorParentElement, self.cursor.getPositionInNode()),
                        self.code.fileName
                    )
                );
                event.preventDefault();
            }

            // self.commandBus.sendCommand('lineParse', self.code.commandGetParseLineMsg(<HTMLElement>event.target));
        })
    }

    setMouseEventListeners() {
        let self = this;
        document.getElementById('lines').addEventListener('click', function (event) {
            self.cursor.setByClick();
            self.autoComplete.hide();
            if (self.pressedKeys['ControlLeft']) {
                self.cursor.goToDefinition(self.fileListing.currentFileName)
            }
            event.preventDefault();
        });

        document.getElementById('filelisting').addEventListener('click', async function (event) {
            event.preventDefault();
            const target: HTMLElement = event.target as HTMLElement;
            if (target.parentElement.className === 'filelink') {
                let lines = await self.fileListing.showFile(target.getAttribute('href'));
                // TODO should count multi line string like ''' '''
                self.lineNumber.adjust(lines.length);
                await self.tags.init(self.fileListing.currentFileName);
                let fileName = target.getAttribute('href');
                self.cursor.clean();
                self.code.clean();
                if (fileName.endsWith('.py')) {
                    self.code = new Code(fileName, self.lineNumber, lines);
                    self.cursor = new PyCursor(self.code, self.lineNumber);
                    self.autoComplete = new PyAutocomplete();
                } else {
                    self.code = new Code(fileName, self.lineNumber, lines);
                    self.cursor = new TxtCursor(self.code, self.lineNumber);
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
