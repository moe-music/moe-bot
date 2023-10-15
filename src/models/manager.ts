import { Shard, ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';

import { JobService, Logger } from '../services/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Debug = require('../../config/debug.json');

export class Manager {
    private logger = new Logger();
    constructor(
        private shardManager: ShardingManager,
        private jobService: JobService
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();

        let shardList = this.shardManager.shardList as number[];

        try {
            this.logger.info(`Spawning shards of ${shardList.length.toLocaleString()}: ${shardList.join(', ')}`);
            await this.shardManager.spawn({
                amount: this.shardManager.totalShards,
                delay: Config.sharding.spawnDelay * 1000,
                timeout: Config.sharding.spawnTimeout * 1000,
            });
            this.logger.info(`All shards spawned`);
        } catch (error) {
            this.logger.error(`Error spawning shards`, error);
            return;
        }

        if (Debug.dummyMode.enabled) {
            return;
        }

        this.jobService.start();
    }

    private registerListeners(): void {
        this.shardManager.on('shardCreate', shard => this.onShardCreate(shard));
    }

    private onShardCreate(shard: Shard): void {
        this.logger.info(`Launched shard ${shard.id.toString()}`);
    }
}
