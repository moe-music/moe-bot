/* eslint-disable import/no-extraneous-dependencies */
import { ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';
import 'reflect-metadata';

import { GuildsController, RootController, ShardsController } from './controllers/index.js';
import { Job, UpdateServerCountJob } from './jobs/index.js';
import { Api } from './models/api.js';
import { Manager } from './models/manager.js';
import { HttpService, JobService, Logger, MasterApiService } from './services/index.js';
import { MathUtils, ShardUtils } from './utils/index.js';

const require = createRequire(import.meta.url);
let Config = require('../config/config.json');
let Debug = require('../config/debug.json');
const logger = new Logger();

async function start(): Promise<void> {
    logger.info('Starting manager');

    // Dependencies
    let httpService = new HttpService();
    let masterApiService = new MasterApiService(httpService);
    if (Config.clustering.enabled) {
        await masterApiService.register();
    }

    // Sharding
    let shardList: number[];
    let totalShards: number;
    try {
        if (Config.clustering.enabled) {
            let resBody = await masterApiService.login();
            shardList = resBody.shardList;
            let requiredShards = await ShardUtils.requiredShardCount(Config.client.token);
            totalShards = Math.max(requiredShards, resBody.totalShards);
        } else {
            let recommendedShards = await ShardUtils.recommendedShardCount(
                Config.client.token,
                Config.sharding.serversPerShard
            );
            shardList = MathUtils.range(0, recommendedShards);
            totalShards = recommendedShards;
        }
    } catch (error) {
        logger.error(`Error retrieving shards: ${error}`);
        return;
    }

    if (shardList.length === 0) {
        logger.warn('No shards to spawn');
        return;
    }

    let shardManager = new ShardingManager('dist/bot.js', {
        token: Config.client.token,
        mode: Debug.override.shardMode.enabled ? Debug.override.shardMode.value : 'process',
        respawn: true,
        totalShards,
        shardList,
    });

    // Jobs
    let jobs: Job[] = [
        Config.clustering.enabled ? undefined : new UpdateServerCountJob(shardManager, httpService),
        // TODO: Add new jobs here
    ].filter(Boolean);

    let manager = new Manager(shardManager, new JobService(jobs));

    // API
    let guildsController = new GuildsController(shardManager);
    let shardsController = new ShardsController(shardManager);
    let rootController = new RootController();
    let api = new Api([guildsController, shardsController, rootController]);

    // Start
    await manager.start();
    await api.start();
    if (Config.clustering.enabled) {
        await masterApiService.ready();
    }
}

process.on('unhandledRejection', (reason, _promise) => {
    logger.error(JSON.stringify(reason));
});

start().catch(error => {
    logger.error(`Error starting manager: ${error}`);
});
