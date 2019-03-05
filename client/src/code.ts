export class Code {
    constructor() {
        let divEl = document.createElement('div');
        divEl.tabIndex = 1;
        divEl.className = 'content-line';
        let spanEl = document.createElement('span');
        divEl.appendChild(spanEl);
        spanEl.appendChild(document.createTextNode(''));
        document.getElementById('code').appendChild(divEl);
    }

    getFirstLine() {
        let firstLine = <HTMLElement>document.getElementsByClassName('content-line').item(0);
        firstLine.focus();
        return firstLine;
    }

    getFirstElement() {
        return this.getFirstLine().childNodes.item(0);
    }

    static getLastLine() {
        let contentLines: HTMLCollection = document.getElementsByClassName('content-line');
        return contentLines[contentLines.length - 1];
    }

    getFirstElementOnLine(node) {
        return node.parentElement.firstChild;
    }

    getLastElementOnLine(node) {
        return node.parentElement.lastChild;
    }

    getPreviousElement(node) {
        if (node.previousElementSibling !== null) {
            return node.previousElementSibling
        } else {
            if (node.parentElement.previousElementSibling !== null) {
                return node.parentElement.previousElementSibling.lastChild;
            } else {
                return null;
            }
        }
    }

    getNextElement(node) {
        if (node.nextElementSibling !== null) {
            return node.nextElementSibling;
        } else {
            if (node.parentElement.nextElementSibling !== null) {
                return node.parentElement.nextElementSibling.firstChild;
            } else {
                return null;
            }
        }
    }

    getPreviousLine(node) {
        let previousLine = node.parentElement.previousElementSibling;
        if (previousLine === null) {
            previousLine = node.parentElement;
        }
        return previousLine;
    }

    static _isElementOnViewPort(el: HTMLElement) {
        let rect = el.getBoundingClientRect(),
            windowHeight = window.innerHeight;
        return (rect.top >= 0 && rect.bottom <= windowHeight);
    }

    getOverElement(node, nodePosition) {
        let oldLinePosition = 0;
        for (let el of node.parentElement.childNodes) {
            if (el === node) {
                oldLinePosition += nodePosition;
                break;
            }
            oldLinePosition += el.textContent.length;
        }

        if (node.parentElement.previousElementSibling !== null){
            let breakFlag = false;
            let newLinePosition = 0;
            let newNodePosition = 0;
            let newNode = node.parentElement.previousElementSibling.firstChild;

            for (let el of node.parentElement.previousElementSibling.childNodes) {
                newLinePosition += el.textContent.length;
                if (newLinePosition >= oldLinePosition + 1) {
                    newNode = el;
                    newNodePosition = el.textContent.length - ( newLinePosition - oldLinePosition);
                    breakFlag = true;
                    break;
                }
            }
            if (!breakFlag){
                newNode = node.parentElement.previousElementSibling.lastChild;
                newNodePosition = newNode.textContent.length - 1;
            }
            return {node: newNode, nodePosition: newNodePosition};
        }
        else{
            return {node: null, nodePosition: 0};
        }
    }

    getUnderElement(node, nodePosition) {
        let oldLinePosition = 0;
        for (let el of node.parentElement.childNodes) {
            if (el === node) {
                oldLinePosition += nodePosition;
                break;
            }
            oldLinePosition += el.textContent.length;
        }

        if (node.parentElement.nextElementSibling !== null){
            let breakFlag = false;
            let newLinePosition = 0;
            let newNodePosition = 0;
            let newNode = node.parentElement.nextElementSibling.firstChild;
            for (let el of node.parentElement.nextElementSibling.childNodes) {
                newLinePosition += el.textContent.length;
                if (newLinePosition >= oldLinePosition + 1) {
                    newNode = el;
                    newNodePosition = el.textContent.length - ( newLinePosition - oldLinePosition);
                    breakFlag = true;
                    break;
                }
            }
            if (!breakFlag){
                newNode = node.parentElement.nextElementSibling.lastChild;
                newNodePosition = newNode.textContent.length - 1;
            }
            return {node: newNode, nodePosition: newNodePosition};
        }
        else{
            return {node: null, nodePosition: 0};
        }
    }

    pageUp(contentLine: HTMLElement) {
        while (contentLine.nextElementSibling) {
            if (!Code._isElementOnViewPort(<HTMLElement>contentLine.nextElementSibling)) {
                contentLine.nextElementSibling.scrollIntoView(true);
                return contentLine.nextElementSibling;
            }
            contentLine = <HTMLElement>contentLine.nextElementSibling;
        }
        return contentLine;
    }

    pageDown(contentLine: HTMLElement) {
        while (contentLine.previousElementSibling) {
            if (!Code._isElementOnViewPort(<HTMLElement>contentLine.previousElementSibling)) {
                contentLine.previousElementSibling.scrollIntoView(true);
                return contentLine.previousElementSibling;
            }
            contentLine = <HTMLElement>contentLine.previousElementSibling;
        }
        return contentLine;

        // let positionPrev = this.columnNumber;
        // for (let i = 0; i < contentLines.length; i++) {
        //     if (TxtCursor._isElementOnViewPort(contentLines[i])) {
        //         if (parseInt(lastElement.getAttribute('tabIndex')) < parseInt(contentLines[i].getAttribute('tabIndex'))) {
        //             lastElement = contentLines[i];
        //         }
        //     }
        // }
        // lastElement.scrollIntoView(true);
        // this._setCursorShift(
        //     this.columnNumber < $(lastElement).text().length ? this.columnNumber : $(lastElement).text().length,
        //     $(lastElement));
        // this.columnNumber = positionPrev;
    }
}