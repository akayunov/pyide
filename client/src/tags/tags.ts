export class Tags {
    private tagElement: HTMLElement;
    constructor (){
        this.tagElement = document.getElementById('tags');
    }

    async init (fileName: string){
        let self = this;
        let response = await (await fetch(`/server/tags/${fileName}`)).json();
        while (this.tagElement.lastChild){
            this.tagElement.removeChild(this.tagElement.lastChild);
        }
        response.forEach(
            function (element: string){
                let divElement = document.createElement('div');
                self.tagElement.appendChild(divElement);
                divElement.outerHTML = element;
            }
        );
    }
}
