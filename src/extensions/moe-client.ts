import { ActivityType, Client, ClientOptions, Presence } from 'discord.js';
import { request } from 'undici';

export class MoeClient extends Client {
    public request = request;
    constructor(clientOptions: ClientOptions) {
        super(clientOptions);
    }

    public setPresence(
        type: Exclude<ActivityType, ActivityType.Custom>,
        name: string,
        url: string
    ): Presence {
        return this.user?.setPresence({
            activities: [
                {
                    type,
                    name,
                    url,
                },
            ],
        });
    }
}
