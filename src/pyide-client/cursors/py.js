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
}