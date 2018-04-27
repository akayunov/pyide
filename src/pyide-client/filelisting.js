;"use strict";

class FileListing {
    constructor() {
        this.curentFile = '';
        let self = this;
        $.ajax({
            method: "GET",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: '/server/filelisting'
        }).done(function (response) {
            response.forEach(
                function (element) {
                    let node = $(element)[0];
                    document.getElementById('filelisting').appendChild(node);
                }
            );
            // console.log('folder listing respone', response)
        }).fail(function (jqXHR, textStatus) {
            console.log('все сломалось в folder listing', jqXHR, textStatus)
        });
    }

    get(event) {
        let parentDiv = event.target.parentNode;
        if (parentDiv.childNodes[0].style.transform === 'rotate(180deg)') {
            parentDiv.childNodes[0].style.transform = 'rotate(90deg)';
            for (let i = parentDiv.childNodes.length - 1; i >= 0; i--) {
                if (['folderlink', 'filelink'].includes(parentDiv.childNodes[i].className)) {
                    parentDiv.removeChild(parentDiv.childNodes[i]);
                }
            }
        }
        else if (parentDiv.childNodes[0].style.transform === 'rotate(90deg)') {
            parentDiv.childNodes[0].style.transform = 'rotate(180deg)';
            $.ajax({
                method: "GET",
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                url: event.target.href
            }).done(function (response) {
                response.forEach(function (element) {
                    $(parentDiv).append($(element));
                    let node = $(element)[0];
                    document.getElementById('filelisting').appendChild(node);
                });
            }).fail(function (jqXHR, textStatus) {
                console.log('все сломалось в folder listing', jqXHR, textStatus)
            });
        }
        else {
            parentDiv.childNodes[0].style.transform = 'rotate(90deg)';
        }
        event.preventDefault();
        event.stopPropagation();
    }

    showFile(event) {
        let self = this, lineCount;
        $.ajax({
            async: false,
            method: "GET",
            url: event.target.attributes['href'].value,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        }).done(function (response) {
            Array.from(document.getElementById('code').children).forEach(
                function (element) {
                    element.remove()
                }
            );
            response.forEach(
                function (element) {
                    document.getElementById('code').appendChild($(element)[0])
                }
            );
            self.curentFile = event.target.attributes['href'].value;
            lineCount = response.length;
        }).fail(function (jqXHR, textStatus) {
            console.log('все сломалось в get CODE', jqXHR, textStatus)
        });
        return lineCount;
    }
}
