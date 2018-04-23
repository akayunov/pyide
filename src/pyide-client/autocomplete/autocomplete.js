;"use strict";
class AutoComplete {
    show (cursorInfo, curentFile) {
        console.log('CUR fie', curentFile, cursorInfo['textBeforeCursor']);
        $.ajax({
            method: "POST",
            url: curentFile,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                "code_string": cursorInfo['textBeforeCursor'],
                "code_line_number": parseInt(cursorInfo['contentLineElement'].attr('tabIndex')),
                "type": "autocomplete"
            })
        }).done(function (response) {
            $('.autocomplete').remove();
            let rect = $('.cursor')[0].getBoundingClientRect();
            let $divElement = $('<div class="autocomplete" style="top:' + rect.bottom + 'px;left:' + rect.left + 'px"></div>');
            let flag = false;
            let list = response.result;
            let prefix = response.prefix;
            list.forEach(function (element) {
                let postfix = element.slice(prefix.length, element.length);
                if (!flag) {
                    $divElement.append($('<div id="active-autocomplete"><span>' + prefix + '</span>'
                        + '<span id="autocomplete-postfix">' + postfix + '</span></div>'));
                    flag = true;
                }
                else {
                    $divElement.append(('<div ><span>' + prefix + '</span>'
                    + '<span id="autocomplete-postfix">' + postfix + '</span></div>'));
                }
            });

            $('body').append($divElement);
        })
            .fail(function (jqXHR, textStatus) {
                AutoComplete.hide();
                console.log('все сломалось в автокомплите: ' + textStatus)
            });
    }
    hide() {
        $('.autocomplete').remove();
    }
    hlNext (){
        let $currentElement = $('#active-autocomplete');
        let $nextElement = $currentElement.next();
        if ($nextElement.length) {
            $currentElement.removeAttr('id');
            $nextElement.attr('id', 'active-autocomplete');
        }
        else {
            $currentElement.removeAttr('id');
            $($('.autocomplete').contents()[0]).attr('id', 'active-autocomplete')
        }
    }
    hlPrev() {
        let $currentElement = $('#active-autocomplete');
        let $nextElement = $currentElement.prev();
        if ($nextElement.length) {
            $currentElement.removeAttr('id');
            $nextElement.attr('id', 'active-autocomplete');
        }
        else {
            $currentElement.removeAttr('id');
            let allAutoCompleteSuggetions = $('.autocomplete').contents();
            $(allAutoCompleteSuggetions[allAutoCompleteSuggetions.length - 1]).attr('id', 'active-autocomplete')
        }
    }
}
