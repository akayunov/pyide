interface FListing {
    files: Array<string>,
    folders: Array<string>
}
export class FileListing {
    private fileListingElement: HTMLElement;
    public currentFileName: string = '';

    constructor() {
        this.fileListingElement = document.getElementById('filelisting');
        this.initListing().then();
    }

    createFolderElement(folderName: string){
        //TODO use template
        let divElement = document.createElement('div');
        divElement.className = 'folderlink';

        let img = document.createElement('img');
        img.className = 'triangle-img';
        img.style.transform = 'rotate(90deg)';
        img.src = '/client/resources/triangle.png';
        divElement.appendChild(img);

        let padding = Array.from(folderName.split('/')).length - 4;
        let span = document.createElement('span');
        span.textContent = '  '.repeat(padding);
        span.className = `padding_${padding}`;
        divElement.appendChild(span);


        let link = document.createElement('a');
        link.text = folderName.split('/').slice(-1)[0];
        link.href = folderName;
        divElement.appendChild(link);
        return divElement;
    }

    createFileElement(fileName: string){
        //TODO use template
        let divElement = document.createElement('div');
        divElement.className = 'filelink';

        let padding = Array.from(fileName.split('/')).length - 3;
        let span = document.createElement('span');
        span.textContent = '  '.repeat(padding);
        span.className = `padding_${padding}`;
        divElement.appendChild(span);

        let link = document.createElement('a');
        link.text = fileName.split('/').slice(-1)[0];
        link.href = fileName;
        divElement.appendChild(link);
        return divElement
    }

    async initListing() {
        let self = this;
        let response: FListing = await (await fetch('/server/filelisting')).json();
        response.folders.forEach(
            function (folderName: string) {
                self.fileListingElement.appendChild(self.createFolderElement(folderName));
            }
        );
        response.files.forEach(
            function (fileName: string) {
                self.fileListingElement.appendChild(self.createFileElement(fileName));
            }
        );
    }

    async get(event: MouseEvent) {
        let self = this;
        const target = <HTMLElement>event.target;
        let parentDiv = target.parentElement;
        const childNode0 = <HTMLElement>parentDiv.childNodes[0];

        if (parentDiv && childNode0.style.transform === 'rotate(180deg)') {
            childNode0.style.transform = 'rotate(90deg)';
            let childElement = parentDiv.lastChild;
            while (childElement) {
                if (['folderlink', 'filelink'].includes((<HTMLElement>childElement).className)) {
                    parentDiv.removeChild(childElement);
                    childElement = parentDiv.lastChild;
                } else {
                    break;
                }
            }
        } else if (childNode0.style.transform === 'rotate(90deg)') {
            childNode0.style.transform = 'rotate(180deg)';
            let response: FListing = await (await fetch((<HTMLAnchorElement>event.target).href)).json();
            response.folders.forEach(function (folderName: string) {
                parentDiv.appendChild(self.createFolderElement(folderName));
            });
            response.files.forEach(function (folderName: string) {
                parentDiv.appendChild(self.createFileElement(folderName));
            });
        } else {
            childNode0.style.transform = 'rotate(90deg)';
        }
    }

    async showFile(url: string) {
        this.currentFileName = url.split('/').slice(3).join('/');
        let response = await fetch(url);
        if (response.ok){
            return await response.json();
        }
        else{
            alert(`Server say: ${response.status} ${response.statusText}. On file name: ${this.currentFileName}`);
        }

    }
}
