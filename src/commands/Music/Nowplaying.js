var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from "discord.js";
import { formatDuration } from "../../utilities/FormatDuration.js";
import { Accessableby } from "../../structures/Command.js";
import { getTitle } from "../../utilities/GetTitle.js";
// Main code
export default class {
    constructor() {
        this.name = ["nowplaying"];
        this.description = "Display the song currently playing.";
        this.category = "Music";
        this.accessableby = [Accessableby.Member];
        this.usage = "";
        this.aliases = ["np"];
        this.lavalink = true;
        this.playerCheck = true;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            yield handler.deferReply();
            const realtime = client.config.player.NP_REALTIME;
            const player = client.rainlink.players.get(handler.guild.id);
            const song = player.queue.current;
            const position = player.position;
            const CurrentDuration = formatDuration(position);
            const TotalDuration = formatDuration(song.duration);
            const Thumbnail = (_a = song === null || song === void 0 ? void 0 : song.artworkUrl) !== null && _a !== void 0 ? _a : `https://img.youtube.com/vi/${song.identifier}/maxresdefault.jpg`;
            const Part = Math.floor((position / song.duration) * 30);
            const fieldDataGlobal = [
                {
                    name: `${client.i18n.get(handler.language, "event.player", "author_title")}`,
                    value: `${song.author}`,
                    inline: true,
                },
                {
                    name: `${client.i18n.get(handler.language, "event.player", "duration_title")}`,
                    value: `${formatDuration(song.duration)}`,
                    inline: true,
                },
                {
                    name: `${client.i18n.get(handler.language, "event.player", "volume_title")}`,
                    value: `${player.volume}%`,
                    inline: true,
                },
                {
                    name: `${client.i18n.get(handler.language, "event.player", "queue_title")}`,
                    value: `${player.queue.length}`,
                    inline: true,
                },
                {
                    name: `${client.i18n.get(handler.language, "event.player", "total_duration_title")}`,
                    value: `${formatDuration(player.queue.duration)}`,
                    inline: true,
                },
                {
                    name: `${client.i18n.get(handler.language, "event.player", "request_title")}`,
                    value: `${song.requester}`,
                    inline: true,
                },
                {
                    name: `${client.i18n.get(handler.language, "event.player", "download_title")}`,
                    value: `**[${song.title}](${song.uri})**`,
                    inline: false,
                },
                {
                    name: `${client.i18n.get(handler.language, "command.music", "np_current_duration", {
                        current_duration: CurrentDuration,
                        total_duration: TotalDuration,
                    })}`,
                    value: `\`\`\`🔴 | ${"─".repeat(Part) + "🎶" + "─".repeat(30 - Part)}\`\`\``,
                    inline: false,
                },
            ];
            const embeded = new EmbedBuilder()
                .setAuthor({
                name: `${client.i18n.get(handler.language, "command.music", "np_title")}`,
                iconURL: `${client.i18n.get(handler.language, "command.music", "np_icon")}`,
            })
                .setColor(client.color)
                .setDescription(`**${getTitle(client, song)}**`)
                .setThumbnail(Thumbnail)
                .addFields(fieldDataGlobal)
                .setTimestamp();
            const NEmbed = yield handler.editReply({ content: " ", embeds: [embeded] });
            const currentNP = client.nowPlaying.get(`${(_b = handler.guild) === null || _b === void 0 ? void 0 : _b.id}`);
            if (currentNP) {
                clearInterval(currentNP.interval);
                yield ((_c = currentNP.msg) === null || _c === void 0 ? void 0 : _c.delete().catch(() => null));
                client.nowPlaying.delete(`${(_d = handler.guild) === null || _d === void 0 ? void 0 : _d.id}`);
            }
            if (realtime) {
                const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    var _e, _f, _g, _h, _j;
                    let currentNPInterval = client.nowPlaying.get(`${(_e = handler.guild) === null || _e === void 0 ? void 0 : _e.id}`);
                    if (!currentNPInterval)
                        currentNPInterval = client.nowPlaying
                            .set(`${(_f = handler.guild) === null || _f === void 0 ? void 0 : _f.id}`, {
                            interval: interval,
                            msg: NEmbed,
                        })
                            .get(`${(_g = handler.guild) === null || _g === void 0 ? void 0 : _g.id}`);
                    if (!player.queue.current)
                        return clearInterval(interval);
                    if (!player.playing)
                        return;
                    const CurrentDuration = formatDuration(player.position);
                    const Part = Math.floor((player.position / song.duration) * 30);
                    const editedField = fieldDataGlobal;
                    editedField.splice(7, 1);
                    editedField.push({
                        name: `${client.i18n.get(handler.language, "command.music", "np_current_duration", {
                            current_duration: CurrentDuration,
                            total_duration: TotalDuration,
                        })}`,
                        value: `\`\`\`🔴 | ${"─".repeat(Part) + "🎶" + "─".repeat(30 - Part)}\`\`\``,
                        inline: false,
                    });
                    const embeded = new EmbedBuilder()
                        .setAuthor({
                        name: `${client.i18n.get(handler.language, "command.music", "np_title")}`,
                        iconURL: `${client.i18n.get(handler.language, "command.music", "np_icon")}`,
                    })
                        .setColor(client.color)
                        .setDescription(`**${getTitle(client, song)}**`)
                        .setThumbnail(Thumbnail)
                        .addFields(editedField)
                        .setTimestamp();
                    try {
                        const channel = (yield client.channels
                            .fetch(`${(_h = handler.channel) === null || _h === void 0 ? void 0 : _h.id}`)
                            .catch(() => undefined));
                        if (!channel)
                            return;
                        const message = yield channel.messages
                            .fetch(`${(_j = currentNPInterval === null || currentNPInterval === void 0 ? void 0 : currentNPInterval.msg) === null || _j === void 0 ? void 0 : _j.id}`)
                            .catch(() => undefined);
                        if (!message)
                            return;
                        if (currentNPInterval && currentNPInterval.msg)
                            currentNPInterval.msg.edit({ content: " ", embeds: [embeded] }).catch(() => null);
                    }
                    catch (err) {
                        return;
                    }
                }), 5000);
            }
            else if (!realtime) {
                if (!player.playing)
                    return;
                if (NEmbed)
                    NEmbed.edit({ content: " ", embeds: [embeded] }).catch(() => null);
            }
        });
    }
}
