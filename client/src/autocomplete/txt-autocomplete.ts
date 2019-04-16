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

    refill(result: Array<string>, lineText: string='', rect: ClientRect=null, parentElement: HTMLElement=null) {
        while (this.autoCompleteElement.firstChild) {
            this.autoCompleteElement.removeChild(this.autoCompleteElement.firstChild);
        }
        this.active = false;
        let flag = false;
        for (let line of  result) {
            if (this.getSymbols(lineText, line).length > 0){
                // there is exists something that needed to complete or all symbols were putted by user
                let span = document.createElement('div');
                span.textContent = line;
                if (!flag) {
                    span.id = 'active-autocomplete';
                    flag = true;
                    this.activeVariant = span;
                }
                this.autoCompleteElement.appendChild(span);
                this.active = true;
            }
        }
        if (this.active){
            // TODO should check that autocomplete can be late and not suitable to current cursor position(performance tests)
            this.autoCompleteElement.style.top = rect.bottom.toString() + 'px';
            this.autoCompleteElement.style.left = rect.left.toString() + 'px';
            parentElement.appendChild(this.autoCompleteElement);
        }
    }

    getSymbols(textCompletedTo: string, completeVariant: string=null) {
        let initCompleteTo = '';
        let completeText = '';
        if (completeVariant !== null){
            completeText = completeVariant;
        }
        else{
            completeText = this.activeVariant.textContent;
        }
        initCompleteTo = completeText;
        while (!textCompletedTo.endsWith(completeText)) {
            completeText = completeText.slice(0, -1)
        }
        return initCompleteTo.slice(completeText.length, initCompleteTo.length);
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
