var Cursor = {
    position: 1,
    _isElementOnViewPort: function (el) {
        var rect = el.getBoundingClientRect(),
            windowHeight = window.innerHeight;
        return (rect.top >= 0 && rect.bottom <= windowHeight );
    },
    _createCursor: function (cursorParentElement, textBefore, cursorLetter, textAfter) {
        if ($(cursorParentElement).parent().attr('class') === 'cursor') {
            console.log('a nichego ne budu delat');
            return;
        }
        var $oldCursor = $('.cursor');
        var oldCursorLetter = $oldCursor.text();
        if ($oldCursor.attr('id') === "to-remove") {
            oldCursorLetter = '';
        }
        $oldCursor.replaceWith($(document.createTextNode(oldCursorLetter)));
        var $textBeforeElement = $(document.createTextNode(textBefore));
        $(cursorParentElement).replaceWith($textBeforeElement);
        if (cursorLetter === '\n') {
            $textBeforeElement.after($(document.createTextNode(cursorLetter + textAfter)));
            $textBeforeElement.after($('<span class="cursor" id="to-remove" >' + ' ' + '</span>'));
        }
        else {
            $textBeforeElement.after($(document.createTextNode(textAfter)));
            $textBeforeElement.after($('<span class="cursor">' + cursorLetter + '</span>'));
        }
    },
    _getCursorPosition: function () {
        var textBeforeCursor = '';
        var stop = false;

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

        var contentLineElement = $('.cursor').parents('.content-line');
        $(contentLineElement).contents().each(closure());
        // console.log('text before', textBeforeCursor.slice(0, textBeforeCursor.length - 1));
        return {
            "contentLineElement": contentLineElement,
            "cursorPosition": textBeforeCursor.length,
            "textBeforeCursor": textBeforeCursor.slice(0, textBeforeCursor.length - 1)
        }
    },
    _setCursorShift: function (cursorShiftSize, contentLineElement) {
        this.position = cursorShiftSize;
        var textBeforeCursor = '';
        var cursorParentElement = null;
        var stop = false;

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
        var textCursorParentElement = $(cursorParentElement).text();
        var text_before = textCursorParentElement.slice(0, textCursorParentElement.length - cursorShiftSize - 1);
        var cursor_letter = textCursorParentElement.slice(
            textCursorParentElement.length - cursorShiftSize - 1, textCursorParentElement.length - cursorShiftSize
        );
        var text_after = textCursorParentElement.slice(textCursorParentElement.length - cursorShiftSize);
        this._createCursor(cursorParentElement, text_before, cursor_letter, text_after);
    },
    init: function () {
        this._setCursorShift(1, $('.content-line')[0]);
    },
    putSymbol: function (char) {
        $('.cursor').before($(document.createTextNode(char)));
        // TODO странно это ведь если я перешел на строку вверх нпример и начал набирать то позиция то будет не +=1 а длина строки плюс 1
        // строка то может быть короче
        this.position += 1;
    },
    deleteSymbolBefore: function () {
        this.moveLeft();
        this.deleteSymbolUnder();
    },
    deleteSymbolUnder: function () {
        var cursor = $('.cursor');
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
    },
    upRow: function () {
        var cursorInfo = this._getCursorPosition();
        var positionPrev = this.position;
        if ($(cursorInfo['contentLineElement']).prev().length) {
            this._setCursorShift(
                this.position < $(cursorInfo['contentLineElement']).prev().text().length ? this.position : $(cursorInfo['contentLineElement']).prev().text().length,
                $(cursorInfo['contentLineElement']).prev());
            $(cursorInfo['contentLineElement']).prev().focus();
        }
        this.position = positionPrev;
    },
    downRow: function () {
        var cursorInfo = this._getCursorPosition();
        var positionPrev = this.position;
        if ($(cursorInfo['contentLineElement']).next().length) {
            this._setCursorShift(
                this.position < $(cursorInfo['contentLineElement']).next().text().length ? this.position : $(cursorInfo['contentLineElement']).next().text().length,
                $(cursorInfo['contentLineElement']).next()
            );
            $(cursorInfo['contentLineElement']).next().focus();
        }
        this.position = positionPrev;
    },
    moveLeft: function () {
        var cursorInfo = this._getCursorPosition();
        if (cursorInfo['cursorPosition'] > 1) {
            this._setCursorShift(cursorInfo['cursorPosition'] - 1, $(cursorInfo['contentLineElement']));
        }
        else if ($(cursorInfo['contentLineElement']).prev().length) {
            this._setCursorShift($(cursorInfo['contentLineElement']).prev().text().length, $(cursorInfo['contentLineElement']).prev());
        }
    },
    moveRight: function () {
        var cursorInfo = this._getCursorPosition();
        var cursorToAdd = $('#to-remove').length ? 1 : 0;
        if (cursorInfo['cursorPosition'] < $(cursorInfo['contentLineElement']).text().length - cursorToAdd) {
            this._setCursorShift(cursorInfo['cursorPosition'] + 1, $(cursorInfo['contentLineElement']));
        }
        else if ($(cursorInfo['contentLineElement']).next().length) {
            this._setCursorShift(1, $(cursorInfo['contentLineElement']).next());
        }
    },
    moveHome: function () {
        var cursorInfo = this._getCursorPosition();
        if (cursorInfo['cursorPosition'] !== 1) {
            this._setCursorShift(1, $(cursorInfo['contentLineElement']));
        }
    },
    moveEnd: function () {
        var cursorInfo = this._getCursorPosition();
        if (cursorInfo['cursorPosition'] !== $(cursorInfo['contentLineElement']).text().length) {
            this._setCursorShift($(cursorInfo['contentLineElement']).text().length, $(cursorInfo['contentLineElement']));
        }
    },
    pageDown: function () {
        var contentLines = $('.content-line'),
            lastElement = contentLines[0];
        var positionPrev = this.position;
        for (var i = 0; i < contentLines.length; i++) {
            if (this._isElementOnViewPort(contentLines[i])) {
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
    },
    pageUp: function () {
        var contentLines = $('.content-line'),
            lastElement = contentLines[contentLines.length - 1];
        var positionPrev = this.position;
        for (var i = 0; i < contentLines.length; i++) {
            if (this._isElementOnViewPort(contentLines[i])) {
                if (parseInt(lastElement.getAttribute('tabIndex')) > parseInt(contentLines[i].getAttribute('tabIndex'))) {
                    lastElement = contentLines[i];
                }
            }
        }
        lastElement.scrollIntoView(false);
        this._setCursorShift(this.position < $(lastElement).text().length ? this.position : $(lastElement).text().length, lastElement);
        this.position = positionPrev;
    },
    setByClick: function () {
        var sel_obj = window.getSelection();
        var $anchor_node = $(sel_obj.anchorNode);
        if ($anchor_node[0].nodeType !== Node.TEXT_NODE) {
            return;
        }
        var text_before = $anchor_node.text().slice(0, sel_obj.anchorOffset);
        var cursor_letter = $anchor_node.text().slice(sel_obj.anchorOffset, sel_obj.anchorOffset + 1);
        var text_after = $anchor_node.text().slice(sel_obj.anchorOffset + 1);
        if (!cursor_letter && text_before) {
            cursor_letter = text_before.slice(text_before.length - 1);
            text_before = text_before.slice(0, text_before.length - 1);
        }
        this._createCursor($anchor_node, text_before, cursor_letter, text_after);
        this.position = this._getCursorPosition()['cursorPosition'];
    },
    addNewRow: function () {
        var $targetContentLine = $('.cursor').parents('.content-line'),
            $nextContentLine = $targetContentLine.clone();
        $targetContentLine.after($nextContentLine);

        $targetContentLine.contents().each(
            (function closure() {
                var start = false;

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
                var stop = false;

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
    }

};

$(document).ready(function () {
    window.Cursor = Cursor;
});