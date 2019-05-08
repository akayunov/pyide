interface TList {
    scops: Array<string>,
    tags: Array<string>
}

export class Tags {
    private tagElement: HTMLElement;
    private url: string = '/server/file/tags';
    constructor (){
        this.tagElement = document.getElementById('tags');
    }

    createTag(tagName: string){
        let divElement = document.createElement('div');
        divElement.className = 'tags';
        let img = document.createElement('img');
        img.className = 'blank-img';
        img.style.transform = 'rotate(90deg)';
        img.src = '/client/resources/blank.png';
        divElement.appendChild(img);

        let padding = 0;  //TODO for while
        let span = document.createElement('span');
        span.textContent = '  '.repeat(padding);
        span.className = `padding_${padding}`;
        divElement.appendChild(span);

        let spanTag = document.createElement('span');
        spanTag.textContent = tagName;
        divElement.appendChild(spanTag);

        return divElement;
    }

    createScop(tagName: string){
        let divElement = document.createElement('div');
        divElement.className = 'tags';
        let img = document.createElement('img');
        img.className = 'triangle-img';
        img.style.transform = 'rotate(90deg)';
        img.src = '/client/resources/triangle.png';
        divElement.appendChild(img);

        let padding = 0;  //TODO for while
        let span = document.createElement('span');
        span.textContent = '  '.repeat(padding);
        span.className = `padding_${padding}`;
        divElement.appendChild(span);

        let spanTag = document.createElement('span');
        spanTag.textContent = tagName;
        divElement.appendChild(spanTag);

        return divElement;
    }

    async init (fileName: string){
        let self = this;
        let response = await fetch(`${self.url}/${fileName}`);
        while (this.tagElement.lastChild){
            this.tagElement.removeChild(this.tagElement.lastChild);
        }
        if (response.ok){
            let resJson = await (response).json();
            resJson.scops.forEach(
                function (tagName: string){
                    self.tagElement.appendChild(self.createScop(tagName));
                }
            );
            resJson.tags.forEach(
                function (tagName: string){
                    self.tagElement.appendChild(self.createTag(tagName));
                }
            );
        }
    }
}
