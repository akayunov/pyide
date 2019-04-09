export class Tags {
    private tagElement: HTMLElement;
    constructor (){
        this.tagElement = document.getElementById('tags');
    }

    async init (fileName: string){
        let self = this;
        let response = await fetch(`/server/tags/${fileName}`);
        while (this.tagElement.lastChild){
            this.tagElement.removeChild(this.tagElement.lastChild);
        }
        if (response.ok){
            let resJson = await (response).json();
            resJson.forEach(
                function (element: string){
                    let divElement = document.createElement('div');
                    self.tagElement.appendChild(divElement);
                    divElement.outerHTML = element;
                }
            );
        }
    }
}
