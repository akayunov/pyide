"use strict";
// function FileListing(){
//
// }
var FileListing = {
    curentFile: '',
    init: function(event) {
        $.ajax({
            method: "GET",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: event === undefined ? '/server/filelisting' : event.target.href
        }).done(function (response) {
            response.forEach(
                function (element){
                    document.getElementById('filelisting').appendChild($(element)[0]);
                }
            );
            // console.log('folder listing respone', response)
        }).fail(function (jqXHR, textStatus) {
            console.log('все сломалось в folder listing',jqXHR, textStatus)
        });
    },
    get: function (event) {
            var parentDiv = event.target.parentNode;
            if (parentDiv.childNodes[0].style.transform === 'rotate(180deg)'){
                parentDiv.childNodes[0].style.transform = 'rotate(90deg)';
                for (var i = parentDiv.childNodes.length - 1; i >=0; i--){
                    if (['folderlink','filelink'].includes(parentDiv.childNodes[i].className)){
                        parentDiv.removeChild(parentDiv.childNodes[i]);
                    }
                }
            }
            else if (parentDiv.childNodes[0].style.transform === 'rotate(90deg)'){
                parentDiv.childNodes[0].style.transform = 'rotate(180deg)';
                $.ajax({
                    method: "GET",
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    url: event.target.href
                }).done(function (response) {
                    console.log('folder listing respone', response, parentDiv);
                    response.forEach(function (element){
                        console.log('element', element);
                        $(parentDiv).append($(element));
                    });
                }).fail(function (jqXHR, textStatus) {
                    console.log('все сломалось в folder listing' , jqXHR, textStatus)
                });
            }
            else{
                parentDiv.childNodes[0].style.transform = 'rotate(90deg)';
            }
            event.preventDefault();
            event.stopPropagation();
        }
};
$(document).ready(function () {
    window.FileListing = FileListing;
});