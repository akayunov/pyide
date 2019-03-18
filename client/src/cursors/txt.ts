import {Code} from '../code';


export class TxtCursor {
    public code: Code;

    private _cursorParentElement: HTMLElement = null;
    private cursorElement: HTMLElement;
    private newLineFlag: boolean = false; // firefox bug about new line character
    private position: number = null;
    // private cursorText: string = '';  use setter/getter
    // private cursorParentElement: HTMLElement = null; use setter/getter


    constructor(code: Code) {
        this.code = code;
        this.createCursorHTMLElement();

        let parentElement = this.code.getFirstElement();
        this.cursorParentElement = parentElement;
        this.cursorParentElement.appendChild(this.cursorElement);
        this.cursorParentElement.appendChild(document.createTextNode(''));
        this.putCursorByPositionInNode(parentElement, 0);

        if (parentElement.textContent === '') {
            // document is empty so do this way
            this.cursorText = ' ';
            this.cursorElement.id = 'to-remove'
        }
    }

    private createCursorHTMLElement(cursorText = '') {
        // TODO create cursor by web component
        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'cursor';
        this.cursorText = cursorText;
    }

    putCursorByPositionInNode(parentCursorNode: HTMLElement, cursorPositionInNode: number) {
        if (parentCursorNode === null) {
            // do nothink if new node is null
            console.log('null element in putCursorByPositionInNode');
            return;
        }

        if (this.cursorParentElement !== parentCursorNode) {
            // delete if put cursor in another node
            this.cursorElement.replaceWith(this.cursorText);
            this.cursorParentElement.normalize();
            this.cursorParentElement = null;
            this.cursorText = '';

            // create new one
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
        } else {
            if (cursorPositionInNode !== this.getPositionInNode() - 1 + 1) {
                let previousSiblingText = '', cursorText = '', nextSiblingText = '';
                previousSiblingText = this.cursorParentElement.textContent.slice(0, cursorPositionInNode);
                cursorText = this.cursorParentElement.textContent.slice(cursorPositionInNode, cursorPositionInNode + 1);
                nextSiblingText = this.cursorParentElement.textContent.slice(cursorPositionInNode + 1);

                this.cursorElement.previousSibling.textContent = previousSiblingText;
                this.cursorText = cursorText;
                this.cursorElement.nextSibling.textContent = nextSiblingText;
            }
        }
        this.scrollIntoView();
    }

    getPositionInNode() {
        return this.cursorElement.previousSibling.textContent.length;
    }

    private resetLinePosition() {
        this.position = null;
    }

    private setLinePosition() {
        if (this.position === null) {
            this.position = this.code.getPositionInLine(this.cursorParentElement, this.getPositionInNode());
        }
    };

    private scrollIntoView(): void {
        this.cursorElement.scrollIntoView({'block': 'nearest', 'inline': 'nearest'});
    }

    set cursorParentElement(el) {
        if (el === null) {
            // this._cursorParentElement.removeAttribute('nodeid');
            // remove by code parsing alghoritm
        } else {
            el.setAttribute('nodeid', Math.floor((Math.random() * 1000000000) + 1).toString());
            this._cursorParentElement = el;
        }
    }

    get cursorParentElement() {
        return this._cursorParentElement;
    }

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
        this.putCursorByPositionInNode(this.cursorParentElement, this.getPositionInNode() - 1 + 1);
        this.resetLinePosition();
    };

    moveLeft() {
        if (this.cursorElement.previousSibling.textContent !== '') {
            this.putCursorByPositionInNode(this.cursorParentElement, this.getPositionInNode() - 1);
        } else if (this.cursorElement.previousSibling.textContent === '') {
            let previousElement = this.code.getPreviousElement(this.cursorParentElement);
            this.putCursorByPositionInNode(previousElement, previousElement.textContent.length - 1);
        }
        this.resetLinePosition();
    };

    moveRight() {
        if (this.cursorElement.nextSibling.textContent !== '') {
            this.putCursorByPositionInNode(this.cursorParentElement, this.getPositionInNode() - 1 + 1 + 1);
        } else if (this.cursorElement.nextSibling.textContent === '') {
            this.putCursorByPositionInNode(this.code.getNextElement(this.cursorParentElement), 0);
        }
        this.resetLinePosition();
    };

    moveUpRow() {
        this.setLinePosition();
        let newPosition = this.code.getOverElement(this.cursorParentElement, this.position);
        this.putCursorByPositionInNode(newPosition.node, newPosition.positionInNode);
    };

    moveDownRow() {
        this.setLinePosition();
        let newPosition = this.code.getUnderElement(this.cursorParentElement, this.position);
        this.putCursorByPositionInNode(newPosition.node, newPosition.positionInNode);
    };

    pageDown() {
        this.setLinePosition();
        let newElement = this.code.pageDown(this.cursorParentElement, this.position);
        this.putCursorByPositionInNode(newElement.node, newElement.positionInNode);
    };

    pageUp() {
        this.setLinePosition();
        let newElement = this.code.pageUp(this.cursorParentElement, this.position);
        this.putCursorByPositionInNode(newElement.node, newElement.positionInNode);
    };

    moveHome() {
        this.putCursorByPositionInNode(this.code.getFirstElementOnLineByNode(this.cursorParentElement), 0);
        this.resetLinePosition();
    };

    moveEnd() {
        let lastElement = this.code.getLastElementOnLineByNode(this.cursorParentElement);
        this.putCursorByPositionInNode(lastElement, lastElement.textContent.length - 1);
        this.resetLinePosition();
    };

    deleteSymbolUnder() {
        this.moveRight();
        if (this.getPositionInNode() !== 0) {
            this.cursorElement.previousSibling.textContent = this.cursorElement.previousSibling.textContent.slice(0, this.getPositionInNode() - 1)
        } else {
            let prevElement = this.code.getPreviousElement(this.cursorParentElement);
            prevElement.textContent = prevElement.textContent.slice(0, prevElement.textContent.length - 1);
            if (prevElement.textContent.length === 0) {
                this.code.removeNode(prevElement);
            }
        }

    };

    deleteSymbolBefore() {
        this.moveLeft();
        this.deleteSymbolUnder();
    };

    setByClick() {
        //TODO works strange fix it
        let selObj = window.getSelection();
        let anchorNode = selObj.anchorNode;
        if (anchorNode.nodeType !== Node.TEXT_NODE) {
            console.log('selected node is not text type');
            return;
        }
        let cursorParentElement = anchorNode.parentElement;
        if (anchorNode.parentElement.className === 'cursor') {
            // click in cursor
            cursorParentElement = cursorParentElement.parentElement;
        }
        this.putCursorByPositionInNode(cursorParentElement, selObj.anchorOffset);
        this.resetLinePosition();
    };

    addNewRow() {
        this.moveLeft();
        let newNode = this.code.divideLine(this.cursorParentElement);
        let positionInNode = this.getPositionInNode();
        this.cursorElement.nextSibling.textContent = '\n';
        this.putCursorByPositionInNode(newNode, positionInNode);
        this.cursorElement.previousSibling.textContent = '';
    };

    goToDefinition(fileName: string) {
        // TODO why is it  here
    }

    putTab() {
        // TODO why is it here
        this.putSymbol('\t');
    }

}
