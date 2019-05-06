import {TxtCursor} from './txt-cursor';
import {Code} from "../code";
import {LineNumber} from "../line-number";
import {EventQueue} from "../event-queue";

export class PyCursor extends TxtCursor {
    public eventQueue: EventQueue;
    constructor(code: Code, lineNumber: LineNumber, eventQueue:EventQueue) {
        super(code, lineNumber, eventQueue);
    }

    putTab() {
        this.putSymbol(' ');
        this.putSymbol(' ');
        this.putSymbol(' ');
        this.putSymbol(' ');
    };


    // goToDefinition(curentFile:string) {
    //     let self = this;
    //     $.ajax({
    //         method: "POST",
    //         url: curentFile,
    //         dataType: 'json',
    //         contentType: 'application/json; charset=utf-8',
    //         data: JSON.stringify({
    //             "code_string": $($(document.getElementsByClassName('cursor')[0]).parents('.content-line')[0]).text(),
    //             "cursor_position": TxtCursor._getCursorSiblingTextsByCursors()[0].textBeforeCursor.length + 1,
    //             "code_line_number": parseInt($(document.getElementsByClassName('cursor')[0]).parents('.content-line')[0].getAttribute('tabIndex')),
    //             "type": "gotodefinition"
    //         })
    //     }).done(function (response) {
    //         let contentLIne = document.querySelector('[tabindex="' + parseInt(response.code_line_number) + '"]') as HTMLElement;
    //         contentLIne.scrollIntoView(true);
    //         let cursorSibling = TxtCursor._getCursorSiblingTextByPosition(response.cursor_position + 1, contentLIne);
    //         TxtCursor._createCursor(contentLIne, cursorSibling.textBeforeCursor, cursorSibling.textCursor, cursorSibling.textAfterCursor);
    //             //self._setCursorShift(response.cursor_position + 1, $(contentLIne));
    //     }).fail(function () {
    //         console.log('все сломалось в го ту дефинишин')
    //     });
    // }
}
