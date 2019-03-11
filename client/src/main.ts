import {LineNumber} from './linenumber';
import {AutoComplete} from './autocomplete/autocomplete';
import {FileListing} from './filelisting';
import {TxtCursor} from './cursors/txt';
import {PyCursor} from './cursors/py';
import {Tags} from './tags/tags';
import {Code} from './code';
import {handlers} from './command';


interface KeyCodes {
    [index: string]: boolean;
}

class Main {
    public code :Code;
    public cursor: TxtCursor;
    public tags :Tags;
    public fileListing : FileListing;
    public autoComplete :AutoComplete;
    public lineNumber : LineNumber;
    public pressedKeys: KeyCodes;
    public socket: WebSocket;
    private readonly serverUrl:string;

    constructor() {
        let self = this;
        //TODO change firefox-> about:config  -> network.websocket.allowInsecureFromHTTPS to false
        this.serverUrl = "ws://127.0.0.1:31415/server/command";
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
            self.createSocket();

        })

    }
    createSocket(){
        let self = this;
        let socket = new WebSocket(this.serverUrl);
        socket.onopen = function() {
            console.log("connected to:", self.serverUrl);
        };

        socket.onclose = function(event) {
            if (event.wasClean) {
                console.log('Clean closed');
            } else {
                console.log('Connection reset by peer');
            }
            console.log('Connection reset, code=:' + event.code + ', reason=' + event.reason);
        };

        socket.onmessage = function(msg:MessageEvent){
            let message = JSON.parse(msg.data);
            console.log('recieve:', message,handlers, message.type ,(typeof message) );
            handlers[message.type].callback(message);

        };
        self.socket = socket;
    }
    sendCommand(msgType:string, args){
        //TODO why can't get by handlers.msgType?
        if (handlers[msgType]){
            this.socket.send(handlers[msgType].getMessage(args))
        }
        else{
            console.log('message handler is not found:', handlers,msgType, handlers[msgType]);
        }
    }

    setKeyBoardEventListeners(){
        let self = this;
        document.getElementById('code').addEventListener('keyup', function (event: KeyboardEvent) {
            self.pressedKeys[event.code] = false;
            event.preventDefault();
        });

        document.getElementById('code').addEventListener('keydown', function (event) {
            self.pressedKeys[event.code] = true;
            // console.log('cod', event.code);

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
                self.sendCommand('lineParse', event.target);
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
                console.log('code', event.code);
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

let main = new Main();
