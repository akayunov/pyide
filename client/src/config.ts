class Config {
    public urls : {
        [index: string]: string
    };

    constructor() {
        this.urls = {
            code: '/server/file/code',
            lineAdd: '/server/file/line',
            lineChange: '/server/file/line',
            lineRemove: '/server/file/line',
            autocomplete: '/server/file/autocomplete',
            gotodefinition: '/server/file/gotodefinition',
        }
    }
}

export let config = new Config();
