export class TxtAutocomplete {
    public active: Boolean;
    public autoCompleteElement: HTMLElement = null;

    constructor() {
        this.active = false;
        this.autoCompleteElement = null;
    }


    commandGetAutocompleteShow(codeLine: HTMLElement, positionInLine: number, fileName: string){
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

    createAutocompleteElement(){
        this.autoCompleteElement = document.createElement('div');
        this.autoCompleteElement.className = 'autocomplete';
    }

    show(result: Array<string>, rect: ClientRect) {
        this.createAutocompleteElement();

        for (let line of  result){
            let span = document.createElement('span');
            span.textContent = line;
            this.autoCompleteElement.appendChild(span);
        }
        this.autoCompleteElement.setAttribute('style', '"top:' + rect.bottom + 'px;left:' + rect.left + 'px"');
    }

    insert(){
        let insertedText = self.autoComplete.children[1].textContent;
        if (insertedText) {
            for (let i = 0; i < insertedText.length; i++) {
                self.cursor.putSymbol(insertedText[i]);
            }
            self.autoComplete.hide();
        } else {
            console.log('insertedText is empty in  main')
        }
    }
    hide() {
        if (this.active) {
            this.active = false;
            this.autoCompleteElement.remove();
        }
    }

    hlNext() {
        if (this.active) {
            let $currentElement = $('#active-autocomplete');
            let $nextElement = $currentElement.next();
            if ($nextElement.length) {
                $currentElement.removeAttr('id');
                $nextElement.attr('id', 'active-autocomplete');
            } else {
                $currentElement.removeAttr('id');
                $($('.autocomplete').contents()[0]).attr('id', 'active-autocomplete')
            }
        }
    }

    hlPrev() {
        if (this.active) {
            let $currentElement = $('#active-autocomplete');
            let $nextElement = $currentElement.prev();
            if ($nextElement.length) {
                $currentElement.removeAttr('id');
                $nextElement.attr('id', 'active-autocomplete');
            } else {
                $currentElement.removeAttr('id');
                let allAutoCompleteSuggetions = $('.autocomplete').contents();
                $(allAutoCompleteSuggetions[allAutoCompleteSuggetions.length - 1]).attr('id', 'active-autocomplete')
            }
        }
    }
}
