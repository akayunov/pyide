import {Code} from '../code';
import {LineNumber} from "../line-number";


export class TxtCursor {
    public code: Code;
    public lineNumber:LineNumber;

    private _cursorParentElement: HTMLElement = null;
    private cursorElement: HTMLElement;
    private position: number = null;
    private cursorHighlightElement: HTMLElement = null;
    // cursorParentElement: HTMLElement = null; use setter/getter

    constructor(code: Code, lineNumber: LineNumber) {
        this.code = code;
        this.lineNumber = lineNumber;
        this.createCursorHTMLElement();
        this.createCursorHighlightElement();

        let parentElement = this.code.getFirstElement();
        this.cursorParentElement = parentElement;
        this.cursorParentElement.appendChild(this.cursorElement);
        this.cursorParentElement.appendChild(document.createTextNode(''));
        this.putCursorByPositionInNode(parentElement, 0);
    }

    private createCursorHighlightElement() {
        // TODO create cursor by web component
        this.cursorHighlightElement = document.createElement('div');
        this.cursorHighlightElement.id = 'cursorHighlightElement';
        this.cursorHighlightElement.style.width = '3px'; //TODO calculate it in runtime
        this.cursorHighlightElement.style.height = '18px'; //TODO calculate it in runtime
        this.cursorHighlightElement.style.background = 'black';
    }

    private createCursorHTMLElement() {
        // TODO create cursor by web component
        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'cursor';
    }

    putCursorByPositionInNode(parentCursorNode: HTMLElement, cursorPositionInNode: number) {
        if (parentCursorNode === null) {
            // do nothink if new node is null
            console.log('null element in putCursorByPositionInNode');
            return;
        }

        if (this.cursorParentElement !== parentCursorNode) {
            // delete if put cursor in another node
            this.cursorParentElement = null;

            // create new one
            let initTextContent = parentCursorNode.textContent;
            this.cursorParentElement = parentCursorNode;
            let childNodes = this.cursorParentElement.childNodes;
            if (childNodes.length !== 1) {
                console.log('childNodes.length:=', childNodes.length);
            }
            let nextTextNode = (<Text>childNodes.item(0)).splitText(cursorPositionInNode);
            nextTextNode.textContent = initTextContent.slice(cursorPositionInNode);
            nextTextNode.before(this.cursorElement);
        } else {
            if (cursorPositionInNode !== this.getPositionInNode()) {
                let previousSiblingText = '', nextSiblingText = '';
                previousSiblingText = this.cursorParentElement.textContent.slice(0, cursorPositionInNode);
                nextSiblingText = this.cursorParentElement.textContent.slice(cursorPositionInNode);
                this.cursorElement.previousSibling.textContent = previousSiblingText;
                this.cursorElement.nextSibling.textContent = nextSiblingText;
            }
            else{
                console.log('Put cursor in same position.');
            }
        }

        let lineNumberElement = this.lineNumber.getByNumber(
            parseInt(parentCursorNode.parentElement.getAttribute('tabIndex')) - 1
        );
        let lineNumberRect = lineNumberElement.getBoundingClientRect();
        let rect = this.cursorElement.getBoundingClientRect();
        this.cursorHighlightElement.style.top = (rect.top - lineNumberRect.top).toString() + 'px';
        this.cursorHighlightElement.style.left = (rect.left - lineNumberRect.left - 3).toString() + 'px'; // TODO culculate this(-3 because of width of cursorHiglight element)
        lineNumberElement.appendChild(this.cursorHighlightElement);

        this.scrollIntoView();  //TODO it should work like to save row position on page change
    }

    clean(){
        this.cursorElement.remove();
        this.cursorElement = null;
        this.cursorHighlightElement.remove();
    }
    getCoordinate() : ClientRect{
        return this.cursorElement.getBoundingClientRect();
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

    getLineNumber(){
        return this.code.getLineNumber(this.cursorParentElement);
    }
    private scrollIntoView(): void {
        this.cursorElement.scrollIntoView({'block': 'nearest', 'inline': 'nearest'});
    }

    set cursorParentElement(el) {
        if (el === null) {
            this.cursorElement.remove();
            this.cursorParentElement.normalize();
            this._cursorParentElement = null;
        } else {
            el.setAttribute('nodeid', Math.floor((Math.random() * 1000000000) + 1).toString());
            this._cursorParentElement = el;
        }
    }

    get cursorParentElement() {
        return this._cursorParentElement;
    }

    putSymbol(char: string) {
        this.cursorElement.previousSibling.textContent += char;
        this.putCursorByPositionInNode(this.cursorParentElement, this.getPositionInNode());
        this.resetLinePosition();
    };

    moveLeft() {
        if (this.cursorElement.previousSibling.textContent !== '') {
            this.putCursorByPositionInNode(this.cursorParentElement, this.getPositionInNode() - 1);
        } else if (this.cursorElement.previousSibling.textContent === '') {
            let previousElement = this.code.getPreviousElement(this.cursorParentElement);
            if (previousElement === null){
                return false;
            }
            this.putCursorByPositionInNode(previousElement, previousElement.textContent.length - 1);
        }
        this.resetLinePosition();
        return true;
    };

    moveRight() {
        if (this.cursorElement.nextSibling.textContent !== '') {
            this.putCursorByPositionInNode(this.cursorParentElement, this.getPositionInNode() + 1);
        } else if (this.cursorElement.nextSibling.textContent === '') {
            let nextElement = this.code.getNextElement(this.cursorParentElement);
            if (nextElement === null){
                return false;
            }
            this.putCursorByPositionInNode(nextElement, 1);
        }
        if (this.cursorElement.previousSibling.textContent.endsWith('\n')){
            let nextElement = this.code.getNextElement(this.cursorParentElement);
            if (nextElement === null){
                nextElement = this.cursorParentElement;
            }
            this.putCursorByPositionInNode(nextElement, 0);
        }

        this.resetLinePosition();
        return true;
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
        console.log('newElement',newElement);
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
        if (this.moveRight()) {
            if (this.getPositionInNode() !== 0) {
                this.cursorElement.previousSibling.textContent = this.cursorElement.previousSibling.textContent.slice(0, this.getPositionInNode() - 1)
            } else {
                let prevElement = this.code.getPreviousElement(this.cursorParentElement);
                prevElement.textContent = prevElement.textContent.slice(0, prevElement.textContent.length - 1);
                if (prevElement.textContent.length === 0) {
                    this.code.removeNode(prevElement);
                }
            }
        }
    };

    deleteSymbolBefore() {
        if (this.moveLeft()){
            this.deleteSymbolUnder();
        }
    };

    setByClick() {
        //TODO works strange fix it
        let selObj = window.getSelection();
        console.log('selObj', selObj, selObj.getRangeAt(0),selObj.getRangeAt(0), '|' + selObj.toString() + '|');
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
        let newNode = this.code.divideLine(this.cursorParentElement);
        let positionInNode = this.getPositionInNode();
        this.cursorElement.nextSibling.textContent = '\n';
        let newText = newNode.textContent.slice(positionInNode);
        newNode.textContent = newText;
        if (newText === ''){
            newNode.appendChild(document.createTextNode(''));
        }
        this.putCursorByPositionInNode(newNode, 0);
        this.cursorElement.previousSibling.textContent = '';
    };

    goToDefinition(fileName: string) {
        // TODO why is it  here
    }

    putTab() {
        // TODO why is it here
        this.putSymbol('\t');
    }

    putString(str: string){
        for (let i of str){
            this.putSymbol(i);
        }
    }

}
