import { ActivityType, Client, ClientOptions, Collection, Presence } from 'discord.js';
import { createRequire } from 'node:module';
import { request } from 'undici';

const require = createRequire(import.meta.url);
let Emojis = require('../../config/emojis.json');

export class MoeClient extends Client {
    public request = request;
    public commands: Collection<string, string> = new Collection();
    public aliases: Collection<string, string> = new Collection();
    public emoji = Emojis;
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
