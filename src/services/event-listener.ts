import { Events } from 'discord.js';

import { Logger } from './index.js';



export class EventListener {
    private static instance: EventListener;
    private readonly logger = new Logger();
   
    private ready = false;
    private constructor() {}
    public static getInstance(): EventListener {
        if (!EventListener.instance) {
            EventListener.instance = new EventListener();
        }
        return EventListener.instance;
    }
    public async process(type: Events, _data: any): Promise<void> {
        switch (type) {
            case Events.InteractionCreate: {
                try {
                    //await this.interactionHandler.process(data);
                } catch (error) {
                    this.logger.error(error);
                }
                break;
            }
        }
    }
}
