import { createRequire } from 'node:module';

import prisma from '../../prisma.js';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');

export class Bot {
    public static async getCommandUsage(): Promise<any> {
        const guild = await prisma.bot.findUnique({
            where: { botId: Config.client.id },
            select: { commands: { select: { times: true } } },
        });
        if (!guild) {
            return null;
        }
        return guild.commands.reduce((acc: any, cur: any) => acc + Number(cur.times), 0);
    }

    public static async getTotalSongs(): Promise<any> {
        const guild = await prisma.bot.findUnique({
            where: { botId: Config.client.id },
            select: { tracks: { select: { times: true } } },
        });
        if (!guild) {
            return null;
        }
        return guild.tracks.reduce((acc: any, cur: any) => acc + Number(cur.times), 0);
    }

    public static async getTopTracks(): Promise<any> {
        const guild = await prisma.track.findMany({
            where: { botId: Config.client.id },
        });
        if (!guild) {
            return null;
        }
        return guild.sort((a: any, b: any) => Number(b.times - a.times)).slice(0, 10);
    }

    public static async getTopCommands(): Promise<any> {
        const guild = await prisma.command.findMany({
            where: { botId: Config.client.id },
        });
        if (!guild) {
            return null;
        }
        return guild.sort((a: any, b: any) => Number(b.times - a.times)).slice(0, 10);
    }
    public static async getTopTracksToday(): Promise<any> {
        const guild = await prisma.track.findMany({
            where: { botId: Config.client.id },
        });
        if (!guild) {
            return null;
        }
        // eslint-disable-next-line max-len
        return guild
            .filter((track: any) => track.lastPlayedTimestamp > Date.now() - 86400000)
            .sort((a: any, b: any) => Number(b.times - a.times))
            .slice(0, 10);
    }

    public static async getTopLike(): Promise<any> {
        const guild = await prisma.track.findMany({
            where: { botId: Config.client.id },
        });
        if (!guild) {
            return null;
        }
        return guild.sort((a: any, b: any) => Number(b.like.likes - a.like.likes)).slice(0, 10);
    }
    public static async updateCommand(commandName: string): Promise<any> {
        const bot = await prisma.bot.findUnique({
            where: { botId: Config.client.id },
        });
        if (!bot) {
            await prisma.bot.create({
                data: {
                    botId: Config.client.id,
                },
            });
        }

        const command = await prisma.command.findUnique({
            where: {
                botId_name: {
                    botId: Config.client.id,
                    name: commandName,
                },
            },
        });
        if (command) {
            await prisma.command.update({
                where: { botId_name: { botId: Config.client.id, name: commandName } },
                data: { times: { increment: 1 }, usedTimestamp: Date.now() },
            });
        } else {
            await prisma.command.create({
                data: {
                    name: commandName,
                    times: 1,
                    usedTimestamp: Date.now(),
                    bot: {
                        connect: {
                            botId: Config.client.id,
                        },
                    },
                },
            });
        }
    }

    public static async updateTrack(track: any): Promise<any> {
        const bot = await prisma.bot.findUnique({
            where: { botId: Config.client.id },
        });
        if (!bot) {
            await prisma.bot.create({
                data: {
                    botId: Config.client.id,
                },
            });
        }
        const existingTrack = await prisma.track.findUnique({
            where: {
                botId_identifier: {
                    botId: Config.client.id,
                    identifier: track.info.identifier,
                },
            },
        });
        if (existingTrack) {
            return await prisma.track.update({
                where: { id: existingTrack.id },
                data: { times: { increment: 1 }, lastPlayedTimestamp: Date.now() },
            });
        } else {
            return await prisma.track.create({
                data: {
                    identifier: track.info.identifier,
                    title: track.info.title,
                    track: track.track,
                    uri: track.info.uri,
                    author: track.info.author,
                    length: track.info.length,
                    isSeekable: track.info.isSeekable,
                    isStream: track.info.isStream,
                    times: 1,
                    lastPlayedTimestamp: Date.now(),
                    requesters: [track.info.requester.id],
                    bot: {
                        connect: {
                            botId: Config.client.id,
                        },
                    },
                },
            });
        }
    }
    public static async getTopLikes(): Promise<any> {
        const guild = await prisma.bot.findUnique({
            where: { botId: Config.client.id },
            select: { tracks: { select: { like: true } } },
        });
        if (!guild) {
            return null;
        }
        return guild.tracks.sort((a: any, b: any) => b.like.likes - a.like.likes).slice(0, 10);
    }
}
