import { ActivityType, ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';

import { Job } from './index.js';
import { MoeClient } from '../extensions/index.js';
import { BotSite } from '../models/config-models.js';
import { HttpService, Logger } from '../services/index.js';
import { ShardUtils } from '../utils/index.js';

const require = createRequire(import.meta.url);
let BotSites: BotSite[] = require('../../config/bot-sites.json');
let Config = require('../../config/config.json');

export class UpdateServerCountJob extends Job {
    private logger = new Logger();
    public name = 'Update Server Count';
    public schedule: string = Config.jobs.updateServerCount.schedule;
    public log: boolean = Config.jobs.updateServerCount.log;
    public runOnce: boolean = Config.jobs.updateServerCount.runOnce;
    public initialDelaySecs: number = Config.jobs.updateServerCount.initialDelaySecs;

    private botSites: BotSite[];

    constructor(
        private shardManager: ShardingManager,
        private httpService: HttpService
    ) {
        super();
        this.botSites = BotSites.filter(botSite => botSite.enabled);
    }

    public async run(): Promise<void> {
        let serverCount = await ShardUtils.serverCount(this.shardManager);

        let type = ActivityType.Streaming;
        let name = `to ${serverCount.toLocaleString()} servers`;
        let url = `https://www.twitch.tv/${Config.client.username}`;

        await this.shardManager.broadcastEval(
            (client: MoeClient, context) => {
                return client.setPresence(context.type, context.name, context.url);
            },
            { context: { type, name, url } }
        );

        this.logger.info(
            `Updated server count to ${serverCount.toLocaleString()}`
        );

        for (let botSite of this.botSites) {
            try {
                let body = JSON.parse(
                    botSite.body.replaceAll('{{SERVER_COUNT}}', serverCount.toString())
                );
                let res = await this.httpService.post(botSite.url, botSite.authorization, body);

                if (!res.ok) {
                    throw res;
                }
            } catch (error) {
                this.logger.error(
                    `Error updating server count on ${botSite.name}: ${error}`
                );
                continue;
            }
            this.logger.info(`Updated server count on ${botSite.name}`);
        }
    }
}
