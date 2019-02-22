export class FileListing {
    public curentFile: string=''
    constructor() {
        this.curentFile = '';
        $.ajax({
            method: "GET",
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: '/server/filelisting'
        }).done(function (response) {
            response.forEach(
                function (element: string) {
                    let node = $(element)[0];
                    const myElement: HTMLElement | null = document.getElementById('filelisting')
                    if ( myElement){
                        myElement.appendChild(node);
                    }
                    else{
                        console.log('нет елемента filelisting')
                    }
                }
            );
            // console.log('folder listing respone', response)
        }).fail(function (jqXHR, textStatus) {
            console.log('все сломалось в folder listing', jqXHR, textStatus)
        });
    }

    get(event: MouseEvent) {
        const target : HTMLElement | null = <HTMLElement>event.target;
        if (target){
            console.log('event.target is empty in folder listing get')
            return;
        }
        let parentDiv: Node | null = target.parentNode;
        if (!parentDiv){
            console.log('event.target.parentNode is empty in folder listing get')
            return;
        }
        const childNode0 : HTMLElement = parentDiv.childNodes[0] as HTMLElement;
        if (parentDiv && childNode0.style.transform === 'rotate(180deg)') {
            childNode0.style.transform = 'rotate(90deg)';
            for (let i = parentDiv.childNodes.length - 1; i >= 0; i--) {
                if (['folderlink', 'filelink'].includes((parentDiv.childNodes[i] as HTMLElement).className)) {
                    parentDiv.removeChild(parentDiv.childNodes[i]);
                }
            }
        }
        else if (childNode0.style.transform === 'rotate(90deg)') {
            childNode0.style.transform = 'rotate(180deg)';
            $.ajax({
                method: "GET",
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                url: (<HTMLAnchorElement>event.target).href
            }).done(function (response) {
                response.forEach(function (element: string) {
                    $(parentDiv).append($(element));
                    let node = $(element)[0];
                    document.getElementById('filelisting').appendChild(node);
                });
            }).fail(function (jqXHR, textStatus) {
                console.log('все сломалось в folder listing', jqXHR, textStatus)
            });
        }
        else {
            childNode0.style.transform = 'rotate(90deg)';
        }
        event.preventDefault();
        event.stopPropagation();
    }

    showFile(event: MouseEvent) {
        let self = this, lineCount;
        $.ajax({
            async: false,
            method: "GET",
            url: (<Element>event.target).attributes['href'].value,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8'
        }).done(function (response) {
            Array.from(document.getElementById('code').children).forEach(
                function (element) {
                    element.remove()
                }
            );
            response.forEach(
                function (element: string) {
                    document.getElementById('code').appendChild($(element)[0])
                }
            );
            self.curentFile = (<Element>event.target).attributes['href'].value;
            lineCount = response.length;
        }).fail(function (jqXHR, textStatus) {
            console.log('все сломалось в get CODE', jqXHR, textStatus)
        });
        return lineCount;
    }
}
