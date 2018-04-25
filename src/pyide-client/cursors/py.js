;"use strict";
class PyCursor extends TxtCursor {
    constructor() {
        super(arguments);
    }

    addNewRow() {
        let $targetContentLine = $('.cursor').parents('.content-line'),
            $nextContentLine = $targetContentLine.clone();
        $targetContentLine.after($nextContentLine);

        $targetContentLine.contents().each(
            (function closure() {
                let start = false;

                function removeTextNodes(index, element) {
                    if (element.className === 'cursor') {
                        $(element).replaceWith($(document.createTextNode('')));
                        start = true;
                        return;
                    }
                    if (element.nodeType === Node.TEXT_NODE && start) {
                        $(element).replaceWith($(document.createTextNode('')));
                    }
                    else {
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

                function removeTextNodes(index, element) {
                    if (element.nodeType === Node.TEXT_NODE && !stop) {
                        $(element).replaceWith($(document.createTextNode('')));
                    }
                    else {
                        if (element.className === 'cursor') {
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
        this.position = this._getCursorPosition()['cursorPosition'];
    };

    deleteSymbolUnder() {
        let cursor = $('.cursor');
        if (cursor.attr('id') === 'to-remove') {
            cursor.parents('.content-line').contents().each(
                function (index, element) {
                    if (element.nodeType === Node.TEXT_NODE) {
                        $(element).replaceWith($(element).text().replace('\n', ''))
                    }
                }
            );
            $(cursor).parents('.content-line').next().contents().each(
                function () {
                    $(cursor).parents('.content-line').append($(this).clone());
                });
            $(cursor).parents('.content-line').next().remove();
        }
        $(cursor).text('');
        $(cursor).parents('.content-line').focus();
        this.moveRight();
    };

    putTab() {
        this.putSymbol(' ');
        this.putSymbol(' ');
        this.putSymbol(' ');
        this.putSymbol(' ');
    };
    goToDefinition(curentFile) {
        let self = this;
        $.ajax({
            method: "POST",
            url: curentFile,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                "code_string": $($(document.getElementsByClassName('cursor')[0]).parents('.content-line')[0]).text(),
                "cursor_position": self._getCursorPosition()['cursorPosition'],
                "code_line_number": parseInt($(document.getElementsByClassName('cursor')[0]).parents('.content-line')[0].getAttribute('tabIndex')),
                "type": "gotodefinition"
            })
        }).done(function (response) {
            let contentLIne = document.querySelector('[tabindex="' + parseInt(response.code_line_number) + '"]');
            contentLIne.scrollIntoView(true);
            self._setCursorShift(response.cursor_position + 1, contentLIne);
        }).fail(function () {
            console.log('все сломалось в го ту дефинишин')
        });
    }
    lineParse (event, curentFile){
        let self = this;
        let cloneElement = $(event.target).clone();
        let cursorEl = cloneElement.find('.cursor');
        if (cursorEl.attr('id') === "to-remove") {
            cursorEl.replaceWith($(document.createTextNode('')));
        }
        let codeString = cloneElement.text();
        console.log(curentFile);
        $.ajax({
            method: "POST",
            url: curentFile,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                "code_string": codeString,
                "code_line_number": parseInt(event.target.getAttribute('tabIndex')),
                "type": "parse"
            })
        }).done(function (response) {
            let $newElement = $(response.code_string[0]);
            $(event.target).replaceWith($newElement);
            // если починить ссе баги на курсор то можно будет тернарный опереатор убрать
            self._setCursorShift(self.position <= $newElement.text().length ? self.position : $newElement.text().length, $newElement);
            $newElement.focus();
        }).fail(function () {
            console.log('все сломалось')
        });
    }
}