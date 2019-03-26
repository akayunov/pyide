import {handlers} from "./command";

export class CommandBus {
    private readonly serverUrl: string;
    private connectionAttemptCounter: number;
    private socket: WebSocket;

    constructor(url: string) {
        this.serverUrl = url;
        this.createSocket();
        this.socket.onmessage = this.onMessage;
        this.socket.onclose = this.onClose;
        this.socket.onopen = this.onOpen;
    }

    createSocket() {
        this.socket = new WebSocket(this.serverUrl);
    }

    onOpen() {
        console.log("connected to:", this.serverUrl);
    }

    onClose(event: CloseEvent) {
        if (event.wasClean) {
            console.log('Clean closed');
        } else {
            console.log('Connection reset by peer');
        }
        console.log('Connection reset, code=:' + event.code + ', reason=' + event.reason, 'connectionAttemptCounter=', this.connectionAttemptCounter);
        if (this.connectionAttemptCounter > 10) {
            console.log('Connection attempt was too mush, just give up: ', this.connectionAttemptCounter);
            this.connectionAttemptCounter = 0;
            throw new Error('Connection attempt was too mush, just give up');
        }
        this.connectionAttemptCounter += 1;
        this.createSocket();
    }

    onMessage(msg: MessageEvent) {
        this.connectionAttemptCounter = 0;
        let message = JSON.parse(msg.data);
        console.log('received:', message, handlers, message.type, (typeof message));
        handlers[message.type](message);
    }

    sendCommand(msgType: string, msg: string) {
        this.connectionAttemptCounter = 0;
        //TODO why can't get by handlers.msgType?
        if (handlers[msgType]) {
            this.socket.send(msg);
            console.log('send:', msg, handlers);
        } else {
            console.log('message handler is not found:', handlers, msgType, handlers[msgType]);
            throw new Error('Message handler is not found');
        }
    }
}
