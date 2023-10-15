import { MoeClient } from '../extensions/index.js';

export class BaseEvent {
    public name: string;
    public once: boolean;
    public client: MoeClient;
    public file: string;
    public fileName: string;
    constructor(client: MoeClient, file: string, options: EventOptions) {
        this.name = options.name;
        this.once = options.once;
        this.client = client;
        this.file = file;
        this.fileName = file.split('.')[0];
    }
    public run(): void {
        throw new Error(`Event ${this.name} doesn't have a run method.`);
    }
}

interface EventOptions {
    name: string;
    once: boolean;
}
