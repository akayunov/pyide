import {handlers} from "./command";

export class CommandBus {
    private readonly serverUrl: string;
    private connectionAttemptCounter: number;
    private socket: WebSocket;

    constructor(url: string) {
        this.serverUrl = url;
        this.createSocket();
    }

    createSocket() {
        this.socket = new WebSocket(this.serverUrl);
        this.socket.onopen = () => {
            console.log("connected to:", this.serverUrl)
        };

        let self = this;
        this.socket.onclose = function (event) {
            if (event.wasClean) {
                console.log('Clean closed');
            } else {
                console.log('Connection reset by peer');
            }
            console.log('Connection reset, code=:' + event.code + ', reason=' + event.reason, 'connectionAttemptCounter=', self.connectionAttemptCounter);
            if (self.connectionAttemptCounter > 10) {
                console.log('Connection attempt was too mush, just give up: ', self.connectionAttemptCounter);
                self.connectionAttemptCounter = 0;
                return;
            }
            self.connectionAttemptCounter += 1;
            self.createSocket();
        };

        this.socket.onmessage = function (msg: MessageEvent) {
            self.connectionAttemptCounter = 0;
            let message = JSON.parse(msg.data);
            console.log('recieve:', message, handlers, message.type, (typeof message));
            handlers[message.type].callback(message);

        };
    }

    sendCommand(msgType: string, el: HTMLElement) {
        this.connectionAttemptCounter = 0;
        //TODO why can't get by handlers.msgType?
        if (handlers[msgType]) {
            this.socket.send(handlers[msgType].getMessage(el));
            console.log('send:', handlers[msgType].getMessage(el), handlers);
        } else {
            console.log('message handler is not found:', handlers, msgType, handlers[msgType]);
        }
    }
}
