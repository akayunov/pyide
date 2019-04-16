import {TxtCursor} from "./cursors/txt-cursor";
import {LineNumber} from "./line-number";

class PositionInNode {
    public node: HTMLElement;
    public positionInNode: number;

    constructor(node: HTMLElement, positionInNode: number) {
        this.node = node;
        this.positionInNode = positionInNode
    }
}

export class Code {
    private screenSize: number = 40; // TODO calculate it on run time and adjust on screen size change
    public fileName: string;
    public lineNumber: LineNumber;
    private codeElement: HTMLElement;

    //TODO should code.ts be divided by type of file like cursor or no?
    // may be for text file we don't need to generate span tag for each world?

    //TODO tabindex should be uniq in file and should not be reusing
    constructor(fileName: string, lineNumber: LineNumber, lines:Array<string>=null) {
        this.fileName = '/' + fileName.split('/').slice(3).join('/');
        this.lineNumber = lineNumber;
        this.createCodeElement();
        if (lines){
            for (let line of lines){
                let el = document.createElement('div');
                this.codeElement.appendChild(el);
                el.outerHTML = line;
            }
        }
        else {
            this.codeElement.appendChild(this.createNewLine(1));
        }
    }

    createCodeElement(){
        let codeElement = document.createElement('div');
        codeElement.tabIndex = -1;
        codeElement.id = 'code';
        document.getElementById('lines').appendChild(codeElement);
        this.codeElement = codeElement;

    }

    clean (){
        // TODO do I really should remove it?
        this.codeElement.remove();
        this.codeElement = null;
    }

    // noinspection JSMethodCanBeStatic
    private createNewLine(tabIndex = 1, text = '') {
        let divElement = document.createElement('div');
        divElement.setAttribute('tabIndex', tabIndex.toString());
        divElement.className = 'content-line';
        let spanElement = document.createElement('span');
        divElement.appendChild(spanElement);
        spanElement.appendChild(document.createTextNode(text));
        return divElement;
    }

    private putNewLineAfter(node: HTMLElement, text = '') {
        let newLine = this.createNewLine(1, text);
        node.parentElement.after(newLine);
        this.lineNumber.addNumber();
        return newLine;
    }

    // noinspection JSMethodCanBeStatic
    private getFirstLine(): HTMLElement {
        let firstLine = <HTMLElement>document.getElementsByClassName('content-line').item(0);
        firstLine.focus();
        return firstLine;
    }

    getLineByNumber(n: number) {
        return <HTMLElement>document.querySelector('[tabIndex="' + n.toString() + '"]');
    }

    // noinspection JSMethodCanBeStatic
    getNodeByPosition(line: HTMLElement, positionInLine: number): PositionInNode {
        let breakFlag = false;
        let newLinePosition = 0;
        let newPositionInNode = 0;
        let newNode = line.firstChild;

        for (let el of line.childNodes) {
            newLinePosition += el.textContent.length;
            if (newLinePosition >= positionInLine ) {
                newNode = el;
                newPositionInNode = el.textContent.length - (newLinePosition - positionInLine);
                breakFlag = true;
                break;
            }
        }
        if (!breakFlag) {
            newNode = line.lastChild;
            newPositionInNode = newNode.textContent.length > 0 ? newNode.textContent.length - 1 : 0;
        }
        return new PositionInNode(<HTMLElement>newNode, newPositionInNode);
    }

    // noinspection JSMethodCanBeStatic
    private recalculateTabIndex(line: HTMLElement): void {
        let tabIndex: number = parseInt(line.previousElementSibling.getAttribute('tabIndex')) + 1;
        line.setAttribute('tabIndex', tabIndex.toString());
        while (line.nextElementSibling) {
            tabIndex += 1;
            line = <HTMLElement>line.nextElementSibling;
            line.setAttribute('tabIndex', tabIndex.toString());
        }
    }

    getFirstElement(): HTMLElement {
        return <HTMLElement>this.getFirstLine().childNodes.item(0);
    }

    // noinspection JSMethodCanBeStatic
    getFirstElementOnLineByNode(node: HTMLElement) {
        return <HTMLElement>node.parentElement.firstChild;
    }

    // noinspection JSMethodCanBeStatic
    getLastElementOnLineByNode(node: HTMLElement) {
        return <HTMLElement>node.parentElement.lastChild;
    }

    // noinspection JSMethodCanBeStatic
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

    // noinspection JSMethodCanBeStatic
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


    // noinspection JSMethodCanBeStatic
    getPositionInLine(node: HTMLElement, positionInNode: number): number {
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


    getLineNumber(node: HTMLElement) {
        return parseInt(node.parentElement.getAttribute('tabIndex'));
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

    pageUp(node: HTMLElement, positionInLine: number): PositionInNode {
        let codeLine = node.parentElement;

        let counter = 0;
        while (codeLine.previousElementSibling) {
            counter += 1;
            codeLine = <HTMLElement>codeLine.previousElementSibling;
            if (counter >= this.screenSize) {
                break;
            }
        }
        return this.getNodeByPosition(codeLine, positionInLine);
    }

    pageDown(node: HTMLElement, positionInLine: number): PositionInNode {
        let codeLine = node.parentElement;

        let counter = 0;
        while (codeLine.nextElementSibling) {
            counter += 1;
            codeLine = <HTMLElement>codeLine.nextElementSibling;
            if (counter >= this.screenSize) {
                break;
            }
        }
        return this.getNodeByPosition(codeLine, positionInLine);
    }


    divideLine(node: HTMLElement): HTMLElement {
        let newLine = this.putNewLineAfter(node);
        newLine.lastChild.replaceWith(node.cloneNode());
        newLine.lastChild.textContent = node.textContent;
        let inserted = [];
        while (node.parentElement.lastElementChild) {
            if (node.parentElement.lastElementChild === node){
                break;
            }
            inserted.push(node.parentElement.removeChild(node.parentElement.lastElementChild));
        }
        for (let n of inserted.reverse()){
            newLine.append(n);
        }
        this.recalculateTabIndex(newLine);
        return <HTMLElement>newLine.firstChild;
    }

    removeNode(node: HTMLElement) {
        let elementToRecalculateFrom = node.parentElement.previousElementSibling !== null ? node.parentElement.previousElementSibling : this.getFirstLine();
        if (node.parentElement.childNodes.length === 1) {
            node.parentElement.remove();
        } else {
            if (node.textContent === '') {
                if (node.parentElement.nextElementSibling && node === node.parentElement.lastChild) {
                    while (node.parentElement.nextElementSibling.firstChild) {
                        node.parentElement.appendChild(
                            node.parentElement.nextElementSibling.removeChild(
                                node.parentElement.nextElementSibling.firstChild
                            )
                        );
                    }
                    node.parentElement.nextElementSibling.remove();
                }
            }
            node.remove();
        }
        this.recalculateTabIndex(<HTMLElement>elementToRecalculateFrom);
    }

    commandGetParseLineMsg(codeLine: HTMLElement) {
        // TODO do schema
        return JSON.stringify({
            "type": "lineParse",
            "data": {
                "fileName": this.fileName,
                "outerHTML": codeLine.outerHTML,  //TODO send test instead of html
                "lineNumber": parseInt(codeLine.getAttribute('tabIndex'))
            }
        });
    }
}