export class FileListing {
    private fileListingElement: HTMLElement;
    public currentFileName: string = '';

    constructor() {
        this.fileListingElement = document.getElementById('filelisting');
        this.initListing().then();
    }

    async initListing() {
        let self = this;
        let response = await (await fetch('/server/filelisting')).json();

        response.forEach(
            function (element: string) {
                let divElement = document.createElement('div');
                self.fileListingElement.appendChild(divElement);
                divElement.outerHTML = element;
            }
        );
    }

    async get(event: MouseEvent) {
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
            let response = await (await fetch((<HTMLAnchorElement>event.target).href)).json();
            response.forEach(function (element: string) {
                let divElement = document.createElement('div');
                parentDiv.appendChild(divElement);
                divElement.outerHTML = element;
            });
        } else {
            childNode0.style.transform = 'rotate(90deg)';
        }
    }

    async showFile(url: string) {
        this.currentFileName = url.split('/').slice(-1)[0];
        return await (await fetch(url)).json();
    }
}
