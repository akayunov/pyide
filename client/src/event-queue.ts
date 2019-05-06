export interface EventQueueResolver {
    resolver: CallableFunction,
    promise: Promise<null>
}


export class EventQueue {
    private readonly resolvers: Array<EventQueueResolver> = [];
    private handlers: {
        [index: string]: CallableFunction;
    } = {};

    constructor(){
        this.resolvers = [];
        for (let i of [...Array(5).keys()]){
            this.resolvers.push(
                this.createResolver()
            );
        }
        setTimeout(this.loop.bind(this), 0);
    }
    createResolver(){
        let resolver: CallableFunction = null;
        let promise = new Promise<any>((res, rej) => {
            resolver = res;
        });
        return {
                resolver: resolver,
                promise: promise
            }
    }

    push (item: any){ //TODO add type
        this.resolvers.push(
            this.createResolver()
        );
        for (let r of this.resolvers){
            if (r.resolver !== null){
                let resolver = r.resolver;
                // to be sure that this promise won't be resolved twice
                // console.log('Resolver function;', r, item);
                r.resolver = null;
                resolver(item);
                break
            }
        }

    }

    async loop(){
        let self = this;
        while (true) {
            // console.log('Before await:',self.resolvers);
            let event = await self.resolvers[0].promise;
            let resolver = self.resolvers.shift();
            console.log('After await:',resolver, event);
            // console.log('Get new event', event);
            let response = await fetch(`/server/code/${event.data.fileName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            });
            if (response.ok) {
                let respJ = await response.json();
                // console.log('respJ', respJ);
                self.handlers[respJ.type](respJ);
            } else {
                //TODO add attempt count
                console.log('Event handling is broken:', response);
            }
        }
    }

    addHandler(type:string, handler:CallableFunction){
        this.handlers[type] = handler;
    }
}