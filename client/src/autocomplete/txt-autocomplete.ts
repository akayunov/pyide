export class TxtAutocomplete {
    public active: Boolean;
    public autoCompleteElement: HTMLElement = null;
    public activeVariant : number = 0;

    constructor() {
        this.createAutocompleteElement([]);
        this.active = false;
    }


    commandGetAutocompleteShow(codeLine: HTMLElement, positionInLine: number, fileName: string) {
        // TODO do schema
        return JSON.stringify({
            "type": "autoCompleteShow",
            "data": {
                "fileName": fileName,
                "lineText": codeLine.textContent,
                "positionInLine": positionInLine,
                "lineNumber": parseInt(codeLine.getAttribute('tabIndex'))
            }
        });
    }

    createAutocompleteElement(result: Array<string>) {
        if (this.active === true){
            this.hide();
        }
        this.active = true;
        this.autoCompleteElement = document.createElement('div');
        this.autoCompleteElement.className = 'autocomplete';
        // this.autoCompleteElement.style.background = 'yellow';
        this.refill(result);

    }

    refill(result: Array<string>){
        while (this.autoCompleteElement.firstChild) {
            this.autoCompleteElement.removeChild(this.autoCompleteElement.firstChild);
        }
        for (let line of  result) {
            let span = document.createElement('div');
            span.textContent = line;
            this.autoCompleteElement.appendChild(span);
        }
    }
    show(rect: ClientRect, parentElement: HTMLElement) {
        this.active = true;
        // this.autoCompleteElement.setAttribute('style', '"top:' + rect.bottom + 'px;left:' + rect.left + 'px"');
        this.autoCompleteElement.style.top = rect.bottom.toString() + 'px';
        this.autoCompleteElement.style.left = rect.left.toString() + 'px';
        parentElement.appendChild(this.autoCompleteElement);
    }

    getSymbols(startPosition:number) {
        return this.autoCompleteElement.childNodes.item(this.activeVariant).textContent.slice(startPosition);
    }

    hide() {
        if (this.active) {
            this.active = false;
            this.autoCompleteElement.remove();
            this.activeVariant = 0;
        }
    }

    hlNext() {
        if (this.activeVariant === this.autoCompleteElement.childNodes.length){
            return;
        }
        (<HTMLElement>this.autoCompleteElement.childNodes.item(this.activeVariant)).removeAttribute('id');
        this.activeVariant += 1;
        if (this.active) {
            let activeVariant = <HTMLElement>this.autoCompleteElement.childNodes.item(this.activeVariant);
            activeVariant.setAttribute('id', 'active-autocomplete');
        }
    }

    hlPrev() {
        if (this.activeVariant === 0){
            return;
        }
        (<HTMLElement>this.autoCompleteElement.childNodes.item(this.activeVariant)).removeAttribute('id');
        this.activeVariant -= 1;
        if (this.active) {
            let activeVariant = <HTMLElement>this.autoCompleteElement.childNodes.item(this.activeVariant);
            activeVariant.setAttribute('id', 'active-autocomplete');
        }
    }
}
