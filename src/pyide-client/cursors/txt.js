;"use strict";

class TxtCursor {
    constructor() {
        this.position = 1
    }

    static _isElementOnViewPort(el) {
        let rect = el.getBoundingClientRect(),
            windowHeight = window.innerHeight;
        return (rect.top >= 0 && rect.bottom <= windowHeight );
    }

    _createCursor(cursorParentElement, textBefore, cursorLetter, textAfter) {
        if ($(cursorParentElement).parent().attr('class') === 'cursor') {
            console.log('a nichego ne budu delat');
            return;
        }
        let $oldCursor = $('.cursor');
        let oldCursorLetter = $oldCursor.text();
        if ($oldCursor.attr('id') === "to-remove") {
            oldCursorLetter = '';
        }
        $oldCursor.replaceWith($(document.createTextNode(oldCursorLetter)));
        let $textBeforeElement = $(document.createTextNode(textBefore));
        $(cursorParentElement).replaceWith($textBeforeElement);
        if (cursorLetter === '\n') {
            $textBeforeElement.after($(document.createTextNode(cursorLetter + textAfter)));
            $textBeforeElement.after($('<span class="cursor" id="to-remove" >' + ' ' + '</span>'));
        }
        else {
            $textBeforeElement.after($(document.createTextNode(textAfter)));
            $textBeforeElement.after($('<span class="cursor">' + cursorLetter + '</span>'));
        }
    }

    _getCursorPosition() {
        let textBeforeCursor = '';
        let stop = false;

        function closure() {
            function getText(index, element) {
                if (stop) {
                    return;
                }
                if (element.nodeType === Node.TEXT_NODE) {
                    textBeforeCursor += $(element).text();
                }
                else {
                    if ($(element).attr('class') === 'cursor') {
                        // if ($(element).attr('id') !== 'to-remove'){
                        //     textBeforeCursor += $('.cursor').text();
                        // }
                        // TODO check it
                        textBeforeCursor += $('.cursor').text();
                        stop = true;
                        return;
                    }
                    $(element).contents().each(getText);
                }
            }

            return getText;
        }

        let contentLineElement = $('.cursor').parents('.content-line');
        $(contentLineElement).contents().each(closure());
        // console.log('text before', textBeforeCursor.slice(0, textBeforeCursor.length - 1));
        return {
            "contentLineElement": contentLineElement,
            "cursorPosition": textBeforeCursor.length,
            "textBeforeCursor": textBeforeCursor.slice(0, textBeforeCursor.length - 1)
        }
    };

    _setCursorShift(cursorShiftSize, contentLineElement) {
        this.position = cursorShiftSize;
        let textBeforeCursor = '';
        let cursorParentElement = null;
        let stop = false;

        function closure() {
            function getText(index, element) {
                if (stop) {
                    return;
                }
                if (element.nodeType === Node.TEXT_NODE) {
                    textBeforeCursor += $(element).text();
                    cursorShiftSize -= $(element).text().length;
                    if (cursorShiftSize <= 0) {
                        stop = true;
                        cursorParentElement = this;
                    }
                }
                else {
                    $(element).contents().each(getText);
                }
            }

            return getText;
        }

        $(contentLineElement).contents().each(closure());
        cursorShiftSize = Math.abs(cursorShiftSize);
        let textCursorParentElement = $(cursorParentElement).text();
        let text_before = textCursorParentElement.slice(0, textCursorParentElement.length - cursorShiftSize - 1);
        let cursor_letter = textCursorParentElement.slice(
            textCursorParentElement.length - cursorShiftSize - 1, textCursorParentElement.length - cursorShiftSize
        );
        let text_after = textCursorParentElement.slice(textCursorParentElement.length - cursorShiftSize);
        this._createCursor(cursorParentElement, text_before, cursor_letter, text_after);
    };

    init() {
        if (!$('.content-line').length) {
            let divEl = document.createElement('div');
            divEl.tabIndex = 1;
            divEl.className = 'content-line';
            let spanEl = document.createElement('span');
            spanEl.textContent = '\n';
            divEl.appendChild(spanEl);
            document.getElementById('code').appendChild(divEl);
        }
        this._setCursorShift(1, $('.content-line')[0]);
        $('.content-line')[0].focus();
    };

    putSymbol(char) {
        $('.cursor').before($(document.createTextNode(char)));
        // TODO странно это ведь если я перешел на строку вверх нпример и начал набирать то позиция то будет не +=1 а длина строки плюс 1
        // строка то может быть короче
        this.position += 1;
    };

    deleteSymbolBefore() {
        this.moveLeft();
        this.deleteSymbolUnder();
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

    upRow() {
        let cursorInfo = this._getCursorPosition();
        let positionPrev = this.position;
        if ($(cursorInfo['contentLineElement']).prev().length) {
            this._setCursorShift(
                this.position < $(cursorInfo['contentLineElement']).prev().text().length ? this.position : $(cursorInfo['contentLineElement']).prev().text().length,
                $(cursorInfo['contentLineElement']).prev());
            $(cursorInfo['contentLineElement']).prev().focus();
        }
        this.position = positionPrev;
    };

    downRow() {
        let cursorInfo = this._getCursorPosition();
        let positionPrev = this.position;
        if ($(cursorInfo['contentLineElement']).next().length) {
            this._setCursorShift(
                this.position < $(cursorInfo['contentLineElement']).next().text().length ? this.position : $(cursorInfo['contentLineElement']).next().text().length,
                $(cursorInfo['contentLineElement']).next()
            );
            $(cursorInfo['contentLineElement']).next().focus();
        }
        this.position = positionPrev;
    };

    moveLeft() {
        let cursorInfo = this._getCursorPosition();
        if (cursorInfo['cursorPosition'] > 1) {
            this._setCursorShift(cursorInfo['cursorPosition'] - 1, $(cursorInfo['contentLineElement']));
        }
        else if ($(cursorInfo['contentLineElement']).prev().length) {
            this._setCursorShift($(cursorInfo['contentLineElement']).prev().text().length, $(cursorInfo['contentLineElement']).prev());
        }
    };

    moveRight() {
        let cursorInfo = this._getCursorPosition();
        let cursorToAdd = $('#to-remove').length ? 1 : 0;
        if (cursorInfo['cursorPosition'] < $(cursorInfo['contentLineElement']).text().length - cursorToAdd) {
            this._setCursorShift(cursorInfo['cursorPosition'] + 1, $(cursorInfo['contentLineElement']));
        }
        else if ($(cursorInfo['contentLineElement']).next().length) {
            this._setCursorShift(1, $(cursorInfo['contentLineElement']).next());
        }
    };

    moveHome() {
        let cursorInfo = this._getCursorPosition();
        if (cursorInfo['cursorPosition'] !== 1) {
            this._setCursorShift(1, $(cursorInfo['contentLineElement']));
        }
    };

    moveEnd() {
        let cursorInfo = this._getCursorPosition();
        if (cursorInfo['cursorPosition'] !== $(cursorInfo['contentLineElement']).text().length) {
            this._setCursorShift($(cursorInfo['contentLineElement']).text().length, $(cursorInfo['contentLineElement']));
        }
    };

    pageDown() {
        let contentLines = $('.content-line'),
            lastElement = contentLines[0];
        let positionPrev = this.position;
        for (let i = 0; i < contentLines.length; i++) {
            if (TxtCursor._isElementOnViewPort(contentLines[i])) {
                if (parseInt(lastElement.getAttribute('tabIndex')) < parseInt(contentLines[i].getAttribute('tabIndex'))) {
                    lastElement = contentLines[i];
                }
            }
        }
        lastElement.scrollIntoView(true);
        this._setCursorShift(
            this.position < $(lastElement).text().length ? this.position : $(lastElement).text().length,
            lastElement);
        this.position = positionPrev;
    };

    pageUp() {
        let contentLines = $('.content-line'),
            lastElement = contentLines[contentLines.length - 1];
        let positionPrev = this.position;
        for (let i = 0; i < contentLines.length; i++) {
            if (TxtCursor._isElementOnViewPort(contentLines[i])) {
                if (parseInt(lastElement.getAttribute('tabIndex')) > parseInt(contentLines[i].getAttribute('tabIndex'))) {
                    lastElement = contentLines[i];
                }
            }
        }
        lastElement.scrollIntoView(false);
        this._setCursorShift(this.position < $(lastElement).text().length ? this.position : $(lastElement).text().length, lastElement);
        this.position = positionPrev;
    };

    setByClick() {
        let sel_obj = window.getSelection();
        let $anchor_node = $(sel_obj.anchorNode);
        if ($anchor_node[0].nodeType !== Node.TEXT_NODE) {
            return;
        }
        let text_before = $anchor_node.text().slice(0, sel_obj.anchorOffset);
        let cursor_letter = $anchor_node.text().slice(sel_obj.anchorOffset, sel_obj.anchorOffset + 1);
        let text_after = $anchor_node.text().slice(sel_obj.anchorOffset + 1);
        if (!cursor_letter && text_before) {
            cursor_letter = text_before.slice(text_before.length - 1);
            text_before = text_before.slice(0, text_before.length - 1);
        }
        this._createCursor($anchor_node, text_before, cursor_letter, text_after);
        this.position = this._getCursorPosition()['cursorPosition'];
    };

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

    putTab() {
        this.putSymbol('\t');
    }
}

