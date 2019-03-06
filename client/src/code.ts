class PositionInNode {
    public node: HTMLElement;
    public positionInNode: number;

    constructor(node: HTMLElement, positionInNode: number) {
        this.node = node;
        this.positionInNode = positionInNode
    }
}

export class Code {
    screenSize: number = 40; // TODO calculate it on run time and adjust on screen size change
    constructor() {
        document.getElementById('code').appendChild(this.createNewLine(1))
    }

    createNewLine(tabIndex = 1, text = '') {
        let divElement = document.createElement('div');
        divElement.tabIndex = tabIndex;
        divElement.className = 'content-line';
        let spanElement = document.createElement('span');
        divElement.appendChild(spanElement);
        spanElement.appendChild(document.createTextNode(text));
        return divElement;
    }

    putNewLineAfter(node: HTMLElement, text = '') {
        let newLine = this.createNewLine(1, text);
        node.parentElement.after(newLine);
        return newLine;
    }

    getFirstLine(): HTMLElement {
        //TODO do I really need all this casting
        let firstLine = <HTMLElement>document.getElementsByClassName('content-line').item(0);
        firstLine.focus();
        return firstLine;
    }

    getFirstElement(): HTMLElement {
        return <HTMLElement>this.getFirstLine().childNodes.item(0);
    }

    getFirstElementOnLineByNode(node: HTMLElement) {
        return <HTMLElement>node.parentElement.firstChild;
    }

    getLastElementOnLineByNode(node: HTMLElement) {
        return <HTMLElement>node.parentElement.lastChild;
    }

    getPreviousElement(node: HTMLElement): HTMLElement {
        if (node.previousElementSibling !== null) {
            return <HTMLElement>node.previousElementSibling
        } else {
            if (node.parentElement.previousElementSibling !== null) {
                return <HTMLElement>node.parentElement.previousElementSibling.lastChild;
            } else {
                return null;
            }
        }
    }

    getNextElement(node: HTMLElement) {
        if (node.nextElementSibling !== null) {
            return <HTMLElement>node.nextElementSibling;
        } else {
            if (node.parentElement.nextElementSibling !== null) {
                return <HTMLElement>node.parentElement.nextElementSibling.firstChild;
            } else {
                return null;
            }
        }
    }

    getPreviousLine(node: HTMLElement) {
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

    getPositionInLine(node: HTMLElement, positionInNode: number) {
        let oldLinePosition = 0;
        for (let el of node.parentElement.childNodes) {
            if (el === node) {
                oldLinePosition += positionInNode;
                break;
            }
            oldLinePosition += el.textContent.length;
        }
        return oldLinePosition;
    }

    getNodeByPosition(line: HTMLElement, positionInLine: number): PositionInNode {
        let breakFlag = false;
        let newLinePosition = 0;
        let newpositionInNode = 0;
        let newNode = line.firstChild;

        for (let el of line.childNodes) {
            newLinePosition += el.textContent.length;
            if (newLinePosition >= positionInLine + 1) {
                newNode = el;
                newpositionInNode = el.textContent.length - (newLinePosition - positionInLine);
                breakFlag = true;
                break;
            }
        }
        if (!breakFlag) {
            newNode = line.lastChild;
            newpositionInNode = newNode.textContent.length - 1;
        }
        return new PositionInNode(<HTMLElement>newNode, newpositionInNode);
    }

    getOverElement(node: HTMLElement, positionInLine: number): PositionInNode {
        if (node.parentElement.previousElementSibling !== null) {
            return this.getNodeByPosition(<HTMLElement>node.parentElement.previousElementSibling, positionInLine);
        } else {
            return new PositionInNode(null, 0);
        }
    }

    getUnderElement(node: HTMLElement, positionInLine: number) {
        if (node.parentElement.nextElementSibling !== null) {
            return this.getNodeByPosition(<HTMLElement>node.parentElement.nextElementSibling, positionInLine);
        } else {
            return new PositionInNode(null, 0)
        }
    }

    pageUp(node: HTMLElement, positionInLine: number) {
        let codeLine = node.parentElement;

        let counter = 0;
        while (codeLine.previousElementSibling) {
            counter += 1;
            codeLine = <HTMLElement>codeLine.previousElementSibling;
            if (counter >= this.screenSize) {
                break;
            }
        }
        this.scrollIntoView(codeLine);
        return this.getNodeByPosition(codeLine, positionInLine);
    }

    pageDown(node: HTMLElement, positionInLine: number) {
        let codeLine = node.parentElement;

        let counter = 0;
        while (codeLine.nextElementSibling) {
            counter += 1;
            codeLine = <HTMLElement>codeLine.nextElementSibling;
            if (counter >= this.screenSize) {
                break;
            }
        }
        this.scrollIntoView(codeLine);
        return this.getNodeByPosition(codeLine, positionInLine);
    }

    scrollIntoView(line: HTMLElement, where = true) {
        if (!Code._isElementOnViewPort(<HTMLElement>line)) {
            line.scrollIntoView(where);
        }
    }

    divideLine(node: HTMLElement): HTMLElement {
        let newLine = this.putNewLineAfter(node);
        newLine.lastChild.replaceWith(node.parentElement.removeChild(node.parentElement.lastChild));

        while (node.parentElement.lastChild) {
            if (node.parentElement.lastChild === node) {
                break;
            }
            newLine.insertBefore(node.parentElement.removeChild(node.parentElement.lastChild), newLine.firstChild);
        }
        return <HTMLElement>newLine.firstChild;
    }

    recalculateTabIndex(node: HTMLElement) {
        let currentElement = node.parentElement;
        let tabIndex = currentElement.previousElementSibling.attributes.tabIndex + 1;
        currentElement.tabIndex = tabIndex;
        while (currentElement.nextElementSibling) {
            tabIndex += 1;
            currentElement = <HTMLElement>currentElement.nextElementSibling;
            currentElement.tabIndex = tabIndex;
        }
    }
}