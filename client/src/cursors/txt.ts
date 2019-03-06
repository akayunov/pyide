import {Code} from '../code';


export class TxtCursor {
    cursorParentElement: HTMLElement = null;
    cursorElement: HTMLElement;
    code: Code;
    newLineFlag: boolean = false; // firefox bug about new line character
    // cursorText: string ='';  use setter/getter
    position: number;

    constructor(code: Code) {
        this.code = code;
        this._createCursorHTMLElement();

        let parentElement = this.code.getFirstElement();
        this._putCursorByPositionInNode(parentElement, 0);

        if (parentElement.textContent === '') {
            // document is empty so do this way
            this.cursorText = ' ';
            this.cursorElement.id = 'to-remove'
        }
    }

    _deleteCursor() {
        this.cursorElement.replaceWith(this.cursorText);
        this.cursorParentElement.normalize();
        this.cursorParentElement = null;
        this.cursorText = '';
    }

    _createCursorHTMLElement(cursorText = '') {
        // TODO create cursor by web component
        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'cursor';
        this.cursorText = cursorText;
    }

    _putCursorByPositionInNode(parentCursorNode: HTMLElement, cursorPositionInNode: number) {
        if (parentCursorNode === null) {
            // do nothink if new node is null
            return;
        }

        if (this.cursorParentElement !== null) {
            // don't delete if cursor not exists
            this._deleteCursor();
        }

        let initTextContent = parentCursorNode.textContent;
        this.cursorParentElement = parentCursorNode;
        let childNodes = this.cursorParentElement.childNodes;
        if (childNodes.length !== 1) {
            console.log('childNodes.length:=', childNodes.length);
        }
        let nextTextNode = (<Text>childNodes.item(0)).splitText(cursorPositionInNode);
        this.cursorText = this.cursorParentElement.textContent.slice(cursorPositionInNode, cursorPositionInNode + 1);
        nextTextNode.textContent = initTextContent.slice(cursorPositionInNode + 1);
        nextTextNode.before(this.cursorElement);
    }

    _resetPosition() {
        this.position = null;
    }

    _setPosition() {
        if (this.position === null) {
            this.position = this.code.getPositionInLine(this.cursorParentElement, this.cursorElement.previousSibling.textContent.length);
        }
    };

    set cursorText(cursorText: string) {
        if (cursorText === '\n') {
            this.newLineFlag = true;
            this.cursorElement.id = 'to-remove';
            this.cursorElement.textContent = ' ';
        } else {
            this.newLineFlag = false;
            this.cursorElement.removeAttribute('id');
            this.cursorElement.textContent = cursorText;
        }
    }

    get cursorText(): string {
        let result = '';
        if (this.cursorElement.id === 'to-remove') {
            // remove first space
            result = this.cursorElement.textContent.slice(1);
        } else {
            result = this.cursorElement.textContent;
        }
        if (this.newLineFlag) {
            result += '\n';
        }
        return result;
    }

    putSymbol(char: string) {
        this.cursorElement.previousSibling.textContent += char;
        this._resetPosition();
    };

    moveLeft() {
        if (this.cursorElement.previousSibling.textContent !== '') {
            this.cursorElement.nextSibling.textContent = this.cursorText + this.cursorElement.nextSibling.textContent;
            this.cursorText = this.cursorElement.previousSibling.textContent.slice(this.cursorElement.previousSibling.textContent.length - 1);
            this.cursorElement.previousSibling.textContent = this.cursorElement.previousSibling.textContent.slice(0, this.cursorElement.previousSibling.textContent.length - 1);
            this.position -= 1;
        } else if (this.cursorElement.previousSibling.textContent === '') {
            let previousElement = this.code.getPreviousElement(this.cursorParentElement);
            this._putCursorByPositionInNode(previousElement, previousElement.textContent.length - 1);
            this.code.scrollIntoView(previousElement);
        }
        this._resetPosition();
    };

    moveRight() {
        if (this.cursorElement.nextSibling.textContent !== '') {
            this.cursorElement.previousSibling.textContent = this.cursorElement.previousSibling.textContent + this.cursorText;
            this.cursorText = this.cursorElement.nextSibling.textContent.slice(0, 1);
            this.cursorElement.nextSibling.textContent = this.cursorElement.nextSibling.textContent.slice(1);
            this.position += 1;
        } else if (this.cursorElement.nextSibling.textContent === '') {
            let nextElement = this.code.getNextElement(this.cursorParentElement);
            this._putCursorByPositionInNode(nextElement, 0);
            this.code.scrollIntoView(nextElement, false);
        }
        this._resetPosition();
    };

    moveUpRow() {
        this._setPosition();
        let newPosition = this.code.getOverElement(this.cursorParentElement, this.position);
        this._putCursorByPositionInNode(newPosition.node, newPosition.positionInNode);
    };

    moveDownRow() {
        this._setPosition();
        let newPosition = this.code.getUnderElement(this.cursorParentElement, this.position);
        this._putCursorByPositionInNode(newPosition.node, newPosition.positionInNode);
    };

    pageDown() {
        this._setPosition();
        let newElement = this.code.pageDown(this.cursorParentElement, this.position);
        this._putCursorByPositionInNode(newElement.node, newElement.positionInNode);
    };

    pageUp() {
        this._setPosition();
        let newElement = this.code.pageUp(this.cursorParentElement, this.position);
        this._putCursorByPositionInNode(newElement.node, newElement.positionInNode);
    };

    moveHome() {
        this._putCursorByPositionInNode(this.code.getFirstElementOnLineByNode(this.cursorParentElement), 0);
        this._resetPosition();
    };

    moveEnd() {
        let lastElement = this.code.getLastElementOnLineByNode(this.cursorParentElement);
        this._putCursorByPositionInNode(lastElement, lastElement.textContent.length - 1);
        this._resetPosition();
    };

    deleteSymbolUnder() {
        this.cursorText = '';
        this.moveRight();
    };

    deleteSymbolBefore() {
        this.moveLeft();
        this.deleteSymbolUnder();
        this._resetPosition();
    };

    setByClick() {
        let sel_obj = window.getSelection();
        let anchor_node = sel_obj.anchorNode;
        if (anchor_node.nodeType !== Node.TEXT_NODE) {
            console.log('selected node is not text type');
            return;
        }
        this._putCursorByPositionInNode(
            anchor_node.parentElement, sel_obj.anchorOffset
        );
        this._resetPosition();
    };

    addNewRow() {
        this.moveLeft();
        let newNode = this.code.divideLine(this.cursorParentElement);
        let shiftedText = this.cursorElement.nextSibling.textContent;
        this.cursorElement.nextSibling.textContent = '\n';
        this._putCursorByPositionInNode(newNode, 0);
        this.cursorElement.previousSibling.textContent = shiftedText;
        this._putCursorByPositionInNode(newNode, 0);
        this._resetPosition();
        this.code.recalculateTabIndex(newNode);
    };

}
