interface Handlers {
    [index: string]: {
        [index: string]: CallableFunction
    };
}

export let handlers: Handlers = {};

export class CommandHandlers {


    constructor() {
    }

    registerCommandHandler(msgType: string, getMessage: CallableFunction, callback: CallableFunction) {
        console.log('getMessage', getMessage,callback ,msgType,handlers);
        handlers[msgType] =
            {
                'getMessage': getMessage,
                'callback': callback
            };
    }

    getMessage(el: HTMLElement) {
        handlers.msgType.getMessage(el)
    }
}