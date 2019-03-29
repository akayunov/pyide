import {handlers} from "./command";

export class CommandBus {
    private readonly serverUrl: string;
    private connectionAttemptCounter: number = 0;
    private socket: WebSocket;

    constructor(url: string) {
        this.serverUrl = url;
        this.createSocket();
    }

    debug(...args: Array<any>){
        console.log(...args);
    }
    createSocket() {
        this.socket = new WebSocket(this.serverUrl);
        this.socket.onmessage = (event) => {this.onMessage(event)};
        this.socket.onclose = (event) => {this.onClose(event)};
        this.socket.onopen = () => {this.onOpen()};
        this.socket.onerror = (event) => {
            console.error("WebSocket error observed:", event);
        }
    }

    onOpen() {
        this.debug("connected to:", this.serverUrl);
    }

    onClose(event: CloseEvent) {
        if (event.wasClean) {
            this.debug('Clean closed');
        } else {
            this.debug('Connection reset by peer');
        }
        this.debug('Connection reset, code=:' + event.code + ', reason=' + event.reason, 'connectionAttemptCounter=', this.connectionAttemptCounter);
        if (this.connectionAttemptCounter > 10) {
            this.debug('Connection attempt was too mush, just give up: ', this.connectionAttemptCounter);
            this.connectionAttemptCounter = 0;
            throw new Error('Connection attempt was too mush, just give up');
        }
        this.connectionAttemptCounter += 1;
        this.debug('Create new connection', this);
        this.socket.close();
        this.createSocket();
    }

    onMessage(msg: MessageEvent) {
        this.connectionAttemptCounter = 0;
        let message = JSON.parse(msg.data);
        this.debug('received:', message, message.type, (typeof message), handlers);
        handlers[message.type](message);
    }

    sendCommand(msgType: string, msg: string) {
        //TODO why can't get by handlers.msgType?
        if (handlers[msgType]) {
            if ( this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(msg);
                this.debug('send:', msg, msgType, (typeof msg));
            }else{
                this.debug('send failed, socket in state: ', this.socket.readyState, msg, handlers);
                this.createSocket();
            }
        } else {
            this.debug('Message handler is not found:', handlers, msgType, handlers[msgType]);
            throw new Error('Message handler is not found');
        }
    }
}
