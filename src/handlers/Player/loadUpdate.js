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
import { getTitle } from "../../utilities/GetTitle.js";
export class PlayerUpdateLoader {
    constructor(client) {
        this.client = client;
        this.loader(this.client);
    }
    loader(client) {
        return __awaiter(this, void 0, void 0, function* () {
            client.UpdateQueueMsg = function (player) {
                return __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let data = yield client.db.setup.get(`${player.guildId}`);
                    if (!data)
                        return;
                    if (data.enable === false)
                        return;
                    let channel = (yield client.channels
                        .fetch(data.channel)
                        .catch(() => undefined));
                    if (!channel)
                        return;
                    let playMsg = yield channel.messages.fetch(data.playmsg).catch(() => undefined);
                    if (!playMsg)
                        return;
                    let guildModel = yield client.db.language.get(`${player.guildId}`);
                    if (!guildModel) {
                        guildModel = yield client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
                    }
                    const language = guildModel;
                    const songStrings = [];
                    const queuedSongs = player.queue.map((song, i) => `${client.i18n.get(language, "event.setup", "setup_content_queue", {
                        index: `${i + 1}`,
                        title: song.title,
                        duration: formatDuration(song.duration),
                        request: `${song.requester}`,
                    })}`);
                    songStrings.push(...queuedSongs);
                    const Str = songStrings.slice(0, 10).join("\n");
                    const TotalDuration = player.queue.duration;
                    let cSong = player.queue.current;
                    let qDuration = `${formatDuration(TotalDuration + Number((_a = player.queue.current) === null || _a === void 0 ? void 0 : _a.duration))}`;
                    let embed = new EmbedBuilder()
                        .setAuthor({
                        name: `${client.i18n.get(language, "event.setup", "setup_author")}`,
                        iconURL: `${client.i18n.get(language, "event.setup", "setup_author_icon")}`,
                    })
                        .setDescription(`${client.i18n.get(language, "event.setup", "setup_desc", {
                        title: getTitle(client, cSong),
                        duration: formatDuration(cSong.duration),
                        request: `${cSong.requester}`,
                    })}`) // [${cSong.title}](${cSong.uri}) \`[${formatDuration(cSong.duration)}]\` • ${cSong.requester}
                        .setColor(client.color)
                        .setImage(`${cSong.artworkUrl
                        ? cSong.artworkUrl
                        : `https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.jpeg?size=300`}`)
                        .setFooter({
                        text: `${client.i18n.get(language, "event.setup", "setup_footer", {
                            volume: `${player.volume}`,
                            duration: qDuration,
                        })}`,
                    }); //Volume • ${player.volume}% | Total Duration • ${qDuration}
                    const queueString = `${client.i18n.get(language, "event.setup", "setup_content")}\n${Str == "" ? " " : "\n" + Str}`;
                    return yield playMsg
                        .edit({
                        content: player.queue.current && player.queue.size == 0 ? " " : queueString,
                        embeds: [embed],
                        components: [client.enSwitchMod],
                    })
                        .catch(() => { });
                });
            };
            /**
             *
             * @param {Player} player
             */
            client.UpdateMusic = function (player) {
                return __awaiter(this, void 0, void 0, function* () {
                    let data = yield client.db.setup.get(`${player.guildId}`);
                    if (!data)
                        return;
                    if (data.enable === false)
                        return;
                    let channel = (yield client.channels
                        .fetch(data.channel)
                        .catch(() => undefined));
                    if (!channel)
                        return;
                    let playMsg = yield channel.messages.fetch(data.playmsg).catch(() => undefined);
                    if (!playMsg)
                        return;
                    let guildModel = yield client.db.language.get(`${player.guildId}`);
                    if (!guildModel) {
                        guildModel = yield client.db.language.set(`${player.guildId}`, client.config.bot.LANGUAGE);
                    }
                    const language = guildModel;
                    const queueMsg = `${client.i18n.get(language, "event.setup", "setup_queuemsg")}`;
                    const playEmbed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({
                        name: `${client.i18n.get(language, "event.setup", "setup_playembed_author")}`,
                    })
                        .setImage(`https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.jpeg?size=300`);
                    return yield playMsg
                        .edit({
                        content: `${queueMsg}`,
                        embeds: [playEmbed],
                        components: [client.diSwitch],
                    })
                        .catch(() => { });
                });
            };
        });
    }
}
