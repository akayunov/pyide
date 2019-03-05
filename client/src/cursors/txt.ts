// export interface Cursor extends TxtCursor{}

import {Code} from './code';
import {AST} from "parse5/lib";
import TextNode = AST.HtmlParser2.TextNode;

export class TxtCursor {
    cursorParentElement: HTMLElement; // test node like <span>, may be use setter/getter to do removeChild/appendChild
    cursorElement: HTMLElement;
    code;
    // cursorText: string ='';  use setter/getter
    position: number; // TODO how to use it right - position in parent node

    constructor(code) {
        this.code = code;
        this._createCursorHTMLElement('\n');
        // TODO have to create cursor to call _putCursorByPositionInNode(which will remove cursor first)
        let parentElement = this.code.getFirstElement();
        this.cursorParentElement = parentElement;
        this.cursorParentElement.appendChild(this.cursorElement);
        this._putCursorByPositionInNode(parentElement, 0);
    }

    deleteCursor() {
        this.cursorElement.replaceWith(this.cursorText);
        this.cursorParentElement.normalize();
        this.cursorParentElement = null;
        this.cursorText = '';
        this.position = 0;
    }

    _createCursorHTMLElement(cursorText) {
        // TODO create cursor by webcomponent
        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'cursor';
        this.cursorText = cursorText;
    }

    // useless
    // _putCursorByPositionInLine(line: HTMLElement, cursorShiftSize: number): void {
    //     this.columnNumber = cursorShiftSize;
    //
    //     let len = 0;
    //     let parentCursorNode = line.lastChild;
    //     let cursorPositionInNode = parentCursorNode.textContent.length;
    //
    //     for (let chNode of line.childNodes) {
    //         len += chNode.textContent.length;
    //         if (len >= this.columnNumber) {
    //             parentCursorNode = chNode;
    //             cursorPositionInNode = len - this.columnNumber;
    //         }
    //     }
    //     this._putCursorByPositionInNode(parentCursorNode, cursorPositionInNode);
    // };

    _putCursorByPositionInNode(parentCursorNode, cursorPositionInNode) {
        if (parentCursorNode === null){
            return;
        }
        this.deleteCursor();

        let initTextContent = parentCursorNode.textContent;
        this.cursorParentElement = parentCursorNode;
        let childNodes = this.cursorParentElement.childNodes;
        if(childNodes.length !== 1){
            console.log('childNodes.length:=', childNodes.length);
        }
        let nextTextNode = (childNodes.item(0) as TextNode).splitText(cursorPositionInNode);
        this.cursorText = this.cursorParentElement.textContent.slice(cursorPositionInNode, cursorPositionInNode + 1);
        nextTextNode.textContent = initTextContent.slice(cursorPositionInNode + 1);
        nextTextNode.before(this.cursorElement);
        this.position = cursorPositionInNode;
    }

    set cursorText(cursorText: string) {
        if (cursorText === '\n') {
            this.cursorElement.id = 'to-remove';
            this.cursorElement.textContent = ' ';
        } else {
            this.cursorElement.removeAttribute('id');
            this.cursorElement.textContent = cursorText;
        }
    }

    get cursorText(): string {
        if (this.cursorElement.id === 'to-remove') {
            return '\n';
        } else {
            return this.cursorElement.textContent;
        }
    }

    putSymbol(char: string) {
        this.cursorElement.previousSibling.textContent += char;
        this.position += 1;
    };

    moveLeft() {
        if (this.cursorElement.previousSibling.textContent !== ''){
            this.cursorElement.nextSibling.textContent = this.cursorText + this.cursorElement.nextSibling.textContent;
            this.cursorText = this.cursorElement.previousSibling.textContent.slice(this.cursorElement.previousSibling.textContent.length - 1);
            this.cursorElement.previousSibling.textContent = this.cursorElement.previousSibling.textContent.slice(0, this.cursorElement.previousSibling.textContent.length - 1);
            this.position -= 1;
        }
        else if (this.cursorElement.previousSibling.textContent === ''){
            let previousElement = this.code.getPreviousElement(this.cursorParentElement);
            // TODO may index -1 will be understood by _putCursorByPositionInNode
            this._putCursorByPositionInNode(previousElement, previousElement.textContent.length - 1);
        }
    };

    moveRight() {
        if (this.cursorElement.nextSibling.textContent !== ''){
            this.cursorElement.previousSibling.textContent = this.cursorElement.previousSibling.textContent + this.cursorText;
            this.cursorText = this.cursorElement.nextSibling.textContent.slice(0, 1);
            this.cursorElement.nextSibling.textContent = this.cursorElement.nextSibling.textContent.slice(1);
            this.position += 1;
        }
        else if (this.cursorElement.nextSibling.textContent === ''){
            this._putCursorByPositionInNode(this.code.getNextElement(this.cursorParentElement), 0);
        }
    };


    moveUpRow() {
        let newPosition = this.code.getOverElement(this.cursorParentElement, this.cursorElement.previousSibling.textContent.length);
        this._putCursorByPositionInNode(newPosition.node, newPosition.nodePosition);
    };

    moveDownRow() {
        let newPosition = this.code.getUnderElement(this.cursorParentElement, this.cursorElement.previousSibling.textContent.length);
        this._putCursorByPositionInNode(newPosition.node, newPosition.nodePosition);
    };

    moveHome() {
        this._putCursorByPositionInNode(this.code.getFirstElementOnLine(this.cursorParentElement), 0);
    };

    moveEnd() {
        let lastElement = this.code.getLastElementOnLine(this.cursorParentElement);
        this._putCursorByPositionInNode(lastElement, lastElement.textContent.length - 1);
    };

    deleteSymbolUnder() {


        let Cursor = this._getCursorSiblingTextsByCursors();
        this.deleteCursor();
        for (let cursorSibling of Cursor) {
            let textBefore = cursorSibling.textBeforeCursor.slice(0, -1);
            let textCursor = cursorSibling.textBeforeCursor.slice(-1);
            let textAfter = cursorSibling.textCursor + cursorSibling.textAfterCursor;
            this._createCursor(cursorSibling.cursorParentElement, textBefore, textCursor, textAfter);
        }
        Cursor[0].cursorParentElement.focus();
        this.resetColumnNumber()
        // if (cursor.attr('id') === 'to-remove') {
        //     cursor.parents('.content-line').contents().each(
        //         function (index, element) {
        //             if (element.nodeType === Node.TEXT_NODE) {
        //                 $(element).replaceWith($(element).text().replace('\n', ''))
        //             }
        //         }
        //     );
        //     $(cursor).parents('.content-line').next().contents().each(
        //         function () {
        //             $(cursor).parents('.content-line').append($(this).clone());
        //         });
        //     $(cursor).parents('.content-line').next().remove();
        // }
        // $(cursor).text('');
        // $(cursor).parents('.content-line').focus();
        // this.moveRight();
    };

    deleteSymbolBefore() {
        this.moveLeft();
        this.deleteSymbolUnder();
    };


    goToDefinition(curentFile: string): any {
    }








    pageDown() {
        // TODO modify method for work with many cursors
        let cursorsSiblings = this._getCursorSiblingTextsByCursors();
        let cursorSibling = cursorsSiblings[0];
        let newElement = this.code.pageDown(cursorSibling.cursorParentElement);
        let newCursorSibling = this._setCursorByPosition(
            cursorSibling.textBeforeCursor.length + 1,
            <HTMLElement>cursorSibling.cursorParentElement.nextElementSibling
        );
        this._createCursor(newCursorSibling.cursorParentElement, newCursorSibling.textBeforeCursor, newCursorSibling.textCursor, newCursorSibling.textAfterCursor);
    };

    pageUp() {
        // TODO modify method for work with many cursors
        let cursorsSiblings = this._getCursorSiblingTextsByCursors();
        let cursorSibling = cursorsSiblings[0];
        let newElement = this.code.pageUp(cursorSibling.cursorParentElement);
        let newCursorSibling = this._setCursorByPosition(
            cursorSibling.textBeforeCursor.length + 1,
            <HTMLElement>cursorSibling.cursorParentElement.nextElementSibling
        );
        this._createCursor(newCursorSibling.cursorParentElement, newCursorSibling.textBeforeCursor, newCursorSibling.textCursor, newCursorSibling.textAfterCursor);
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
    };

    addNewRow() {
        let $targetContentLine = $('.cursor').parents('.content-line'),
            $nextContentLine = $targetContentLine.clone();
        $targetContentLine.after($nextContentLine);

        $targetContentLine.contents().each(
            (function closure() {
                let start = false;

                function removeTextNodes(index: number, element: Node) {
                    if ((<HTMLElement>element).className === 'cursor') {
                        $(element).replaceWith($(document.createTextNode('')));
                        start = true;
                        return;
                    }
                    if (element.nodeType === Node.TEXT_NODE && start) {
                        $(element).replaceWith($(document.createTextNode('')));
                    } else {
                        $(element).contents().each(removeTextNodes);
                    }
                }

                return removeTextNodes;
            })()
        );
        $targetContentLine.append($(document.createTextNode('\n')));
        // послетакого остаеться много елементов пустых - как бы от них избавиться
        $nextContentLine.contents().each(
            (function closure() {
                let stop = false;

                function removeTextNodes(index: number, element: Node) {
                    if (element.nodeType === Node.TEXT_NODE && !stop) {
                        $(element).replaceWith($(document.createTextNode('')));
                    } else {
                        if ((<HTMLElement>element).className === 'cursor') {
                            stop = true;
                            return;
                        }
                        $(element).contents().each(removeTextNodes);
                    }
                }

                return removeTextNodes;
            })()
        );
        $nextContentLine.focus();
        $nextContentLine.attr('tabIndex', parseInt($targetContentLine.attr('tabIndex')) + 1);
        $nextContentLine.nextAll().each(
            function (index, element) {
                $(element).attr('tabIndex', parseInt($(element).attr('tabIndex')) + 1);
            }
        );
        // this.columnNumber = this._getCursorPosition()['cursorPosition'];
    };

    putTab() {
        this.putSymbol('\t');
    }

    lineParse(event: KeyboardEvent, curentFile: string) {
    };
}
