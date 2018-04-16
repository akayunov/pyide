"use strict";
var AutoComplete = {
    show: function () {
        var cursorInfo = Cursor._getCursorPosition();
        console.log('CUR fie', FileListing.curentFile, cursorInfo['textBeforeCursor']);
        $.ajax({
            method: "POST",
            url: FileListing.curentFile,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                "code_string": cursorInfo['textBeforeCursor'],
                "code_line_number": parseInt(cursorInfo['contentLineElement'].attr('tabIndex')),
                "type": "autocomplete"
            })
        }).done(function (response) {
            $('.autocomplete').remove();
            var rect = $('.cursor')[0].getBoundingClientRect();
            var $divElement = $('<div class="autocomplete" style="top:' + rect.bottom + 'px;left:' + rect.left + 'px"></div>');
            var flag = false;
            var list = response.result;
            var prefix = response.prefix;
            list.forEach(function (element) {
                var postfix = element.slice(prefix.length, element.length);
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
    },
    hide: function () {
        $('.autocomplete').remove();
    },
    hlNext: function () {
        var $currentElement = $('#active-autocomplete');
        var $nextElement = $currentElement.next();
        if ($nextElement.length) {
            $currentElement.removeAttr('id');
            $nextElement.attr('id', 'active-autocomplete');
        }
        else {
            $currentElement.removeAttr('id');
            $($('.autocomplete').contents()[0]).attr('id', 'active-autocomplete')
        }
    },
    hlPrev : function () {
        var $currentElement = $('#active-autocomplete');
        var $nextElement = $currentElement.prev();
        if ($nextElement.length) {
            $currentElement.removeAttr('id');
            $nextElement.attr('id', 'active-autocomplete');
        }
        else {
            $currentElement.removeAttr('id');
            var allAutoCompleteSuggetions = $('.autocomplete').contents();
            $(allAutoCompleteSuggetions[allAutoCompleteSuggetions.length - 1]).attr('id', 'active-autocomplete')
        }
    }
};
$(document).ready(function () {
    window.AutoComplete = AutoComplete;
});