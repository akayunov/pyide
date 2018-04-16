;function Tags(){
    this.init = function (event){
        $.ajax({
            method: "GET",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: event.target.href.replace(/:31415\/server\/code/, ':31415\/server/tags')
        }).done(function (response) {
            var parentDiv = document.getElementById('tags');
            for (var i = parentDiv.childNodes.length - 1; i >=0; i--){
                parentDiv.removeChild(parentDiv.childNodes[i]);
            }
            response.forEach(
                function (element){
                    document.getElementById('tags').appendChild($(element)[0]);
                }
            );
            // console.log('folder listing respone', response)
        }).fail(function (jqXHR, textStatus) {
            console.log('все сломалось в tags listing',jqXHR, textStatus)
        });
    }
}
$(document).ready(function () {
    window.Tags = new Tags();
});
