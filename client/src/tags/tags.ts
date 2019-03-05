export class Tags {
    constructor (){}
    init (event: MouseEvent){
        $.ajax({
            method: "GET",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: (<HTMLAnchorElement>event.target).href.replace(/:31415\/server\/code/, ':31415\/server/tags')
        }).done(function (response) {
            const parentDiv: HTMLElement | null = document.getElementById('tags');
            if (parentDiv){
                for (let i = parentDiv.childNodes.length - 1; i >=0; i--){
                    parentDiv.removeChild(parentDiv.childNodes[i]);
                }
            }
            else{
                console.log('parentDiv is empty in  tags listing')
            }
            response.forEach(
                function (element: string){
                    const tags: HTMLElement | null = document.getElementById('tags');
                    if(tags){
                        tags.appendChild($(element)[0]);
                    }
                    else{
                        console.log('tags is empty in  tags listing')
                    }
                   }
            );
            // console.log('folder listing respone', response)
        }).fail(function (jqXHR, textStatus) {
            console.log('все сломалось в tags listing',jqXHR, textStatus)
        });
    }
}
