interface Handlers {
    [index: string]: CallableFunction
}

export let handlers: Handlers = {};

export class CommandHandlers {


    constructor() {
    }

    registerCommandHandler(msgType: string, callback: CallableFunction) {
        console.log('getMessage',callback ,msgType,handlers);
        handlers[msgType] = callback;
    }
}