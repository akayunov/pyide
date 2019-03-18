import {LineNumber} from './linenumber';
import {AutoComplete} from './autocomplete/autocomplete';
import {FileListing} from './filelisting';
import {TxtCursor} from './cursors/txt';
import {PyCursor} from './cursors/py';
import {Tags} from './tags/tags';
import {Code} from './code';
import {CommandBus} from './commandbus';
import {CommandHandlers} from './command';


interface KeyCodes {
    [index: string]: boolean;
}

interface LineParse {
    type: string;
    lineNumber: number;
    lineElements: Array<string>;
}

class Main extends CommandHandlers{
    public code :Code;
    public cursor: TxtCursor;
    public tags :Tags;
    public fileListing : FileListing;
    public autoComplete :AutoComplete;
    public lineNumber : LineNumber;
    public pressedKeys: KeyCodes;
    private readonly serverUrl:string;
    private commandBus: CommandBus;

    constructor() {
        super();
        let self = this;
        //TODO change firefox-> about:config  -> network.websocket.allowInsecureFromHTTPS to false
        this.serverUrl = "ws://" + window.location.host + "/server/command";
        document.addEventListener('DOMContentLoaded', function () {
            self.setKeyBoardEventListeners();
            self.setMouseEventListeners();
            self.code = new Code('');

            self.cursor = new TxtCursor(self.code);

            self.tags = new Tags();

            self.fileListing = new FileListing(self.code);

            self.autoComplete = new AutoComplete();

            self.lineNumber = new LineNumber(1);

            self.pressedKeys = {};
            self.commandBus = new CommandBus(self.serverUrl);

            // TODO may be do it in Command.ts to more clear code
            self.registerCommandHandler("lineParse", (codeLine: HTMLElement) => {
                    // TODO do schema
                    let msg = {
                        "type": "lineParse",
                        "data": {
                            "fileName": self.code.fileName,
                            "lineText": codeLine.textContent,
                            "outerHTML": codeLine.outerHTML,
                            "lineNumber": parseInt(codeLine.getAttribute('tabIndex'))
                        }
                    };
                    return JSON.stringify(msg);
                },
                (jsonData: LineParse) => {
                    let line = self.code.getLineByNumber(jsonData.lineNumber);
                    let oldPosition = self.code.getPositionInLine(self.cursor.cursorParentElement, self.cursor.getPositionInNode());
                    self.code.replaceLine(jsonData.lineNumber, jsonData.lineElements);
                    let newPosition = self.code.getNodeByPosition(line, oldPosition);
                    self.cursor.putCursorByPositionInNode(newPosition.node, newPosition.positionInNode);
                });
        })
    }

    setKeyBoardEventListeners(){
        let self = this;
        document.getElementById('code').addEventListener('keyup', function (event: KeyboardEvent) {
            self.pressedKeys[event.code] = false;
            event.preventDefault();
        });

        document.getElementById('code').addEventListener('keydown', function (event) {
            self.pressedKeys[event.code] = true;
            // console.log('code', event.code);
            if (event.code === 'Enter') {
                self.cursor.addNewRow();
                event.preventDefault();
            } else if (event.code === 'Tab') {
                if (document.getElementById('active-autocomplete')) {
                    const activeAutoComplete = document.getElementById('active-autocomplete');
                    let insertedText = activeAutoComplete.children[1].textContent;
                    if (insertedText) {
                        for (let i = 0; i < insertedText.length; i++) {
                            self.cursor.putSymbol(insertedText[i]);
                        }
                        self.autoComplete.hide();
                    } else {
                        console.log('insertedText is empty in  main')
                    }
                } else {
                    self.cursor.putTab();
                }
                event.preventDefault();
            } else if (event.code === 'ArrowUp') {
                if (document.getElementsByClassName('autocomplete').length) {
                    self.autoComplete.hlPrev();
                } else {
                    self.cursor.moveUpRow();
                }
                event.preventDefault();
            } else if (event.code === 'ArrowDown') {
                if (document.getElementsByClassName('autocomplete').length) {
                    self.autoComplete.hlNext();
                } else {
                    self.cursor.moveDownRow();
                }
                event.preventDefault();
            } else if (event.code === 'Space') {
                self.cursor.putSymbol(event.key);
                self.autoComplete.hide();
                console.log('events.target:', event.target, event.currentTarget, event);
                self.commandBus.sendCommand('lineParse', <HTMLElement>event.target);
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
                event.preventDefault();
            } else if (event.code === 'ArrowRight') {
                self.cursor.moveRight();
                event.preventDefault();
            } else if (event.code === 'ShiftLeft') {
            } else if (event.code === 'ControlLeft') {
            } else if (event.code === 'AltLeft') {
            } else if (event.code === 'F5') {
            } else if (event.code === 'Backspace') {
                self.cursor.deleteSymbolBefore();
                // autoComlete.show(cursor._getCursorPosition(), fileListing.curentFile);
                event.preventDefault();
            } else if (event.code === 'Delete') {
                self.cursor.deleteSymbolUnder();
                event.preventDefault();
            } else {
                self.cursor.putSymbol(event.key);
                // autoComlete.show(cursor._getCursorPosition(), fileListing.curentFile);
                event.preventDefault();
            }
        })
    }

    setMouseEventListeners(){
        let self = this;
        document.getElementById('code').addEventListener('click', function (event) {
            self.cursor.setByClick();
            self.autoComplete.hide();
            if (self.pressedKeys['ControlLeft']) {
                self.cursor.goToDefinition(self.fileListing.curentFile)
            }
            event.preventDefault();
        });

        document.getElementById('filelisting').addEventListener('click', function (event) {
            const target: HTMLElement = event.target as HTMLElement;
            if (target.parentElement.className === 'filelink') {

                let lineCount = self.fileListing.showFile(event);
                // should count multi line string like ''' '''
                self.lineNumber.adjust(lineCount);
                // tags.init(event);
                let fileName = target.getAttribute('href');
                if (fileName.endsWith('.py')) {
                    self.code = new Code(fileName);
                    self.cursor = new PyCursor(self.code);
                } else {
                    self.code = new Code(fileName);
                    self.cursor = new TxtCursor(self.code);
                }
            } else if (target.parentElement.className === 'folderlink') {
                self.fileListing.get(event);
            }

            event.preventDefault();
        });
    }
}

new Main();
