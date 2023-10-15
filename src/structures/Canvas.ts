/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
import { CanvasRenderingContext2D, createCanvas, loadImage, registerFont } from 'canvas';
import type { User } from 'discord.js';
import fs from 'node:fs';
import { dirname , resolve } from 'node:path';
import { fileURLToPath } from 'node:url';


import { MoeClient } from '../extensions/moe-client.js';
import prisma from '../prisma.js';
import { FormatUtils } from '../utils/format-utils.js';


const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsFolder = resolve(__dirname, '..', '..', 'assets', 'fonts');

fs.readdirSync(fontsFolder).forEach((file) => {
    if (file.endsWith('.ttf')) {
        const fontPath = resolve(fontsFolder, file);
        registerFont(fontPath, { family: file.replace('.ttf', '') });
    }
});


export default class Canvas {
   
    constructor(private client: MoeClient) {
        this.client = client;
    }
    public async userProfile(user: User): Promise<Buffer> {

        const users = await prisma.profile.findFirst({
            where: {
                userId: user.id
            }
        });

        const premium = await prisma.premium.findFirst({
            where: {
                userId: user.id
            }
        });
        // make a new canvas size 1500x600
        const color = users.color;
        const canvas = createCanvas(1500, 600);
        const ctx = canvas.getContext('2d');
        // load the background image
        const bwImage = await loadImage(resolve(__dirname, '..', '..', 'assets', 'images', 'setup', 'profile.png'));

        ctx.drawImage(bwImage, 0, 0, canvas.width, canvas.height);

        // convert the image to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);

        // set the blend mode to "multiply"
        ctx.globalCompositeOperation = 'multiply';

        // draw the original image over the grayscale image
        ctx.drawImage(bwImage, 0, 0, canvas.width, canvas.height);
        // create the box
        createCustomBox(0, 0, canvas.width, canvas.height, color, ctx);
        // end blend mode
        ctx.globalCompositeOperation = 'normal';

        const badges = users.badges;
        const Cmd = await prisma.command.findMany({
            where: {
                userId: user.id
            }
        });
        const Traks = await prisma.track.findMany({
            where: {
                userId: user.id
            }
        });
        // top tracks box
        roundRect(ctx, 610, 10, 430, 400, 15);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        // commands box
        roundRect(ctx, 1060, 10, 430, 400, 15);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        // user box
        roundRect(ctx, 610, 430, 430, 158, 15);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        // achievements box
        roundRect(ctx, 1060, 430, 430, 158, 15);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();

        // add title
        ctx.font = '30px Roboto-Bold';
        ctx.fillStyle = 'white';
        ctx.fillText('TOP PLAYED TRACKS', 670, 50);
        ctx.font = '30px Roboto-Bold';
        ctx.fillStyle = 'white';
        ctx.fillText('TOP USED COMMANDS', 1110, 50);
        // top tracks
        Traks.sort((a, b) => Number(b.times - a.times));
        for (let i = 0; i < Math.min(Traks.slice(0, 5).length); i++) {
            const data = Traks.slice(0, 5);
            roundRect(ctx, 630, 100 + (i * 60), 40, 40, 5);
            ctx.fillStyle = hexToRgbA(color, 0.5);
            ctx.fill();
            // add index number in box
            ctx.font = '30px Roboto';
            ctx.fillStyle = 'white';
            ctx.fillText((i + 1).toString(), 640, 130 + (i * 60));
            // add track title
            ctx.font = '25px Roboto';
            ctx.fillStyle = 'white';
            ctx.fillText(`${data[i].title.length > 17 ? data[i].title.slice(0, 17) + '...' : data[i].title}`, 680, 125 + (i * 60));
            // add track total play same line of track title
            ctx.font = '20px Roboto';
            ctx.fillStyle = '#787878';

            ctx.fillText(`(${data[i].times})`, data[i].title.padEnd(20, ' ').slice(0, 20).length * 13 + 680, 125 + (i * 60));
        }
        Cmd.sort((a, b) => Number(b.times - a.times));
        for (let i = 0; i < Math.min(Cmd.slice(0, 5).length); i++) {
            // 5 cmd box
            const data = Cmd.slice(0, 5);
            roundRect(ctx, 1080, 100 + (i * 60), 40, 40, 5);
            ctx.fillStyle = hexToRgbA(color, 0.5);
            ctx.fill();
            // add index number in box
            ctx.font = '30px Roboto';
            ctx.fillStyle = 'white';
            ctx.fillText((i + 1).toString(), 1090, 130 + (i * 60));
            // add cmd title
            ctx.font = '25px Roboto';
            ctx.fillStyle = 'white';
            ctx.fillText(`${data[i].name.length > 20 ? data[i].name.slice(0, 20) + '...' : data[i].name}`, 1130, 125 + (i * 60));
            // add cmd total play same line of cmd title
            ctx.font = '20px Roboto';
            ctx.fillStyle = '#787878';
            ctx.fillText(` (${data[i].times})`, data[i].name.padEnd(20, ' ').length * 13 + 1130, 125 + (i * 60));

        }
        // user name
        ctx.font = '40px Roboto-Bold';
        ctx.fillStyle = 'white';
        ctx.fillText(`${user.username.length > 10 ? user.username.slice(0, 10) + '...' : user.username}`, canvas.width / 2 - ctx.measureText(`${user.username.length > 10 ? user.username.slice(0, 10) + '...' : user.username}`).width / 6, 490);
        // user bio
        ctx.font = '20px Roboto';
        ctx.fillStyle = '#787878';
        ctx.fillText(`${users.bio.length > 20 ? users.bio.slice(0, 20) + '...' : users.bio}`, canvas.width / 2 - ctx.measureText(`${users.bio.length > 20 ? users.bio.slice(0, 20) + '...' : users.bio}`).width / 6, 530);

        // user premium
        if (premium && premium.isPremium) {
            textAndBackground(ctx, 'PRO ', canvas.width / 2 - ctx.measureText(`${user.username.length > 10 ? user.username.slice(0, 10) + '...' : user.username}`).width / 4 + ctx.measureText(`${user.username.length > 10 ? user.username.slice(0, 10) + '...' : user.username}`).width + 100, 460, hexToRgbA(color, 0.5));
        }
        // add title
        ctx.font = '30px Roboto-Bold';
        ctx.fillStyle = 'white';
        ctx.fillText('ACHIEVEMENTS', 1160, 470);

        for (let i = 0; i < badges.length; i++) {
            const badge = badges[i];
            if (badge === 'NONE') continue;
            const badgeImage = await loadImage(resolve(__dirname, '..', '..', 'assets', 'images', 'badges', `${badge}.png`));
            let x, y;
            const row = Math.floor(i / 7);
            if (row === 0) {
                x = 1050 + (i * 60);
                y = 490;
            } else {
                x = 1110 + ((i - (7 * row)) * 60);
                y = 540;
            }
            ctx.drawImage(badgeImage, x, y, 40, 40);
        }
        // user image
        const image = user.avatarURL({ extension: 'png', size: 1024 });
        if (image) {
            const url = image;
            let { buffer, status } = await this.client.request(url).then(async (r) => {
                return {
                    buffer: await r.body.arrayBuffer(),
                    status: r.statusCode
                };
            });
            if (status !== 200) buffer = await this.client.request(url).then((r) => r.body.arrayBuffer());
            const thumb = await loadImage(Buffer.from(buffer));
            ctx.save();
            ctx.beginPath();
            roundedImage(10, 10, 580, 580, 15, ctx);
            // add stroke and shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 15;
            ctx.shadowOffsetY = 0;
            ctx.stroke();
            ctx.clip();
            ctx.drawImage(thumb, 10, 10, 580, 580);
        }

        ctx.save();
        const buf = canvas.toBuffer('image/png');
        const final = Buffer.alloc(buf.length, buf, 'base64');
        return final;

    }
    private async getColor(sourceName: string, uri: string): Promise<string> {
        let isNew = false;
        let oldUri = null;
        let color: string;
        if (oldUri !== uri) {
            isNew = true;
            oldUri = uri;
        } else {
            isNew = false;
        }
        if (isNew) {
            if (sourceName === 'spotify') {
                //color = await this.spotify.getColor(uri);
            } else if (sourceName === 'youtube') {
                color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            } else if (sourceName === 'soundcloud') {
                color = '#ff7700';
            } else if (sourceName === 'applemusic') {
                //color = await this.apple.getColor(uri);
            } else if (sourceName === 'yandex') {
                color = '#ff0000';
            }
        }
        return color;
    }
    public async setupImage(player: any): Promise<Buffer> {
        if (!player || !player.currentTrack) return;

        const { title, uri, length, requester, image, author, sourceName } = player.currentTrack.info;
        const color = await this.getColor(sourceName, uri);
        const parsedCurrentDuration = FormatUtils.formatTime(player.position);
        const parsedDuration = FormatUtils.formatTime(length);
        const percentage = player.position / length;
        const canvas = createCanvas(1280, 460);
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        const cornerRadius = 20;
        // box 1
        roundRect(ctx, 470, 12, 800, 275, 15);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        // box 2
        roundRect(ctx, 470, 315, 800, 130, 15);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        // progress bar in box 2
        const progressBarWidth = 700; // Adjust this value to control the width of the progress bar
        const progressFillWidth = progressBarWidth * percentage;

        // progress bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        roundRect(ctx, 520, 345, 700, 30, 15);
        ctx.fill();

        // progress bar fill

        ctx.fillStyle = color;
        roundRect(ctx, 520, 345, progressFillWidth, 30, 15);
        ctx.fill();

        // Draw dot for the current playing position
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(520 + progressFillWidth, 345 + 15, 20, 0, 2 * Math.PI);
        ctx.fill();

        // Draw current duration boxes and text within the bar line start
        ctx.font = '30px Roboto-Bold';
        ctx.fillStyle = color;
        ctx.fillText(parsedCurrentDuration, 520, 425);

        // Draw total duration text (move to the end of the progress bar)
        ctx.font = '30px Roboto-Bold';
        ctx.fillStyle = color;
        ctx.fillText(parsedDuration, 1140, 425);

        // Draw track title
        ctx.font = '70px Roboto-Bold';
        ctx.fillStyle = color;
        ctx.fillText(title.length > 20 ? title.slice(0, 20) + '...' : title, 500, 130);

        // Draw author and song requests
        ctx.font = '30px Roboto-Bold';
        ctx.fillStyle = '#787878';
        ctx.fillText(author.length > 30 ? author.slice(0, 30) + '...' : author, 500, 190);

        // Draw author and song requests
        ctx.font = '30px Roboto-Bold';
        ctx.fillStyle = '#787878';
        ctx.fillText(requester.username.length > 30 ? requester.username.slice(0, 30) + '...' : requester.username, 500, 240);

        if (image) {
            let url = image;
            if (url.includes('https://img.youtube.com/')) {
                url = this.client.user.avatarURL({ extension: 'png', size: 1024 });
            }
            const { buffer, status } = await this.client.request(url).then(async (r) => {
                return {
                    buffer: await r.body.arrayBuffer(),
                    status: r.statusCode
                };
            });
            if (status === 200) {
                const thumb = await loadImage(Buffer.from(buffer));
                ctx.save();
                ctx.beginPath();
                roundedImage(10, 10, 440, 440, cornerRadius, ctx);
                ctx.clip();
                ctx.drawImage(thumb, 10, 10, 460, 460);
                ctx.restore();
            }
        }
        const buf = canvas.toBuffer('image/png');
        const final = Buffer.alloc(buf.length, buf, 'base64');
        return final;
    }

    public async defaultImage(): Promise<Buffer> {
        // make a new canvas size 1280x720
        const canvas = createCanvas(1280, 720);
        const ctx = canvas.getContext('2d');
        // load the background image
        const bg = await loadImage(resolve(__dirname, '..', '..', 'assets', 'images', 'setup', 'image.png'));
        // draw background image
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        const buf = canvas.toBuffer('image/png');
        const final = Buffer.alloc(buf.length, buf, 'base64');
        return final;
    }
}

function roundedImage(x: number, y: number, width: number, height: number, radius: number, ctx: any): void {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.closePath();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}
function createCustomBox(x: number, y: number, width: number, height: number, color: string, ctx: any): void {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function textAndBackground(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string): void {
    roundRect(ctx, x, y, ctx.measureText(text).width + 4, 30, 5);
    ctx.fillStyle = color;
    ctx.fill();
    // add text in box
    ctx.font = '20px Roboto';
    ctx.fillStyle = 'white';
    ctx.fillText(text, ctx.measureText(text).width / 7 + x, y + 23);
}

CanvasRenderingContext2D.prototype.roundRect = function (x: any, y: any, w: any, h: any, r: any) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
};


function hexToRgbA(hex: string, alpha: number): string {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        // eslint-disable-next-line no-mixed-operators
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + `,${alpha})`;
    }
    throw new Error('Bad Hex');
}
