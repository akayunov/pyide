export class Code {
    screenSize: number = 40; // TODO calculate it on run time
    constructor() {
        document.getElementById('code').appendChild(this.createNewLine(1))
    }

    createNewLine(tabIndex = 1, text=''){
        let divElement = document.createElement('div');
        divElement.tabIndex = tabIndex;
        divElement.className = 'content-line';
        let spanElement = document.createElement('span');
        divElement.appendChild(spanElement);
        spanElement.appendChild(document.createTextNode(text));
        return divElement;
    }

    putNewLineAfter(node, text=''){
        let newLine = this.createNewLine(1, text);
        node.parentElement.parentElement.appendChild(newLine);
        return newLine;
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

    getFirstElementOnLine(line){
        return line.firstChild;
    }
    getFirstElementOnLineByNode(node) {
        return node.parentElement.firstChild;
    }

    getLastElementOnLineByNode(node) {
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

    getPositionInLine(node, nodePosition) {
        let oldLinePosition = 0;
        for (let el of node.parentElement.childNodes) {
            if (el === node) {
                oldLinePosition += nodePosition;
                break;
            }
            oldLinePosition += el.textContent.length;
        }
        return oldLinePosition;
    }

    getNodeByPosition(line, positionInLine) {
        let breakFlag = false;
        let newLinePosition = 0;
        let newNodePosition = 0;
        let newNode = line.firstChild;

        for (let el of line.childNodes) {
            newLinePosition += el.textContent.length;
            if (newLinePosition >= positionInLine + 1) {
                newNode = el;
                newNodePosition = el.textContent.length - (newLinePosition - positionInLine);
                breakFlag = true;
                break;
            }
        }
        if (!breakFlag) {
            newNode = line.lastChild;
            newNodePosition = newNode.textContent.length - 1;
        }
        return {node: newNode, nodePosition: newNodePosition};
    }

    getOverElement(node, positionInLine) {
        if (node.parentElement.previousElementSibling !== null) {
            return this.getNodeByPosition(node.parentElement.previousElementSibling, positionInLine);
        } else {
            return {node: null, nodePosition: 0};
        }
    }

    getUnderElement(node, positionInLine) {
        if (node.parentElement.nextElementSibling !== null) {
            return this.getNodeByPosition(node.parentElement.nextElementSibling, positionInLine);
        } else {
            return {node: null, nodePosition: 0};
        }
    }

    pageUp(node, positionInLine) {
        let codeLine = node.parentElement;

        let counter = 0;
        while (codeLine.previousElementSibling) {
            counter += 1;
            codeLine = <HTMLElement>codeLine.previousElementSibling;
            if (counter >= this.screenSize){
                break;
            }
            // if (!Code._isElementOnViewPort(<HTMLElement>codeLine)) {
            //     break;
            // }
        }
        // codeLine.scrollIntoView(true);
        this.scrollIntoView(codeLine);
        return this.getNodeByPosition(codeLine, positionInLine);
    }

    pageDown(node, positionInLine) {
        let codeLine = node.parentElement;

        let counter = 0;
        while (codeLine.nextElementSibling) {
            counter += 1;
            codeLine = <HTMLElement>codeLine.nextElementSibling;
            if (counter >= this.screenSize){
                break;
            }
            // if (!Code._isElementOnViewPort(<HTMLElement>codeLine)) {
            //     break;
            // }
        }
        // codeLine.scrollIntoView(true);
        this.scrollIntoView(codeLine);
        return this.getNodeByPosition(codeLine, positionInLine);
    }

    scrollIntoView(line, where=true){
        if (!Code._isElementOnViewPort(<HTMLElement>line)) {
            line.scrollIntoView(where);
        }
    }

}