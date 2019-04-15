export class TxtAutocomplete {
    public active: Boolean;
    public autoCompleteElement: HTMLElement = null;
    public activeVariant: HTMLElement = null;

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
        if (this.active) {
            this.hide();
        }
        this.active = true;
        this.autoCompleteElement = document.createElement('div');
        this.autoCompleteElement.className = 'autocomplete';

        this.refill(result);

    }

    refill(result: Array<string>) {
        while (this.autoCompleteElement.firstChild) {
            this.autoCompleteElement.removeChild(this.autoCompleteElement.firstChild);
        }
        let flag = false;
        for (let line of  result) {
            let span = document.createElement('div');
            span.textContent = line;
            if (!flag) {
                span.id = 'active-autocomplete';
                flag = true;
                this.activeVariant = span;
            }
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

    getSymbols(lineText: string) {
        let completeText = this.activeVariant.textContent;
        while (!lineText.endsWith(completeText)){
            completeText = completeText.slice(0, -1)
        }
        return this.activeVariant.textContent.slice(completeText.length, this.activeVariant.textContent.length);
    }

    hide() {
        console.log('hide', this);
        if (this.active) {
            this.active = false;
            this.autoCompleteElement.remove();
        }
    }

    hlNext() {
        let nextElement = this.activeVariant.nextElementSibling || (<HTMLElement>this.autoCompleteElement.firstChild);
        if (nextElement !== null) {
            this.activeVariant.id = '';
            this.activeVariant = (<HTMLElement>nextElement);
            this.activeVariant.id = 'active-autocomplete';
        }
    }

    hlPrev() {
        let nextElement = this.activeVariant.previousElementSibling || (<HTMLElement>this.autoCompleteElement.lastChild);
        if (nextElement !== null) {
            this.activeVariant.id = '';
            this.activeVariant = (<HTMLElement>nextElement);
            this.activeVariant.id = 'active-autocomplete';
        }
    }
}
