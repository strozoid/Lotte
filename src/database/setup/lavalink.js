var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chillout from "chillout";
export class AutoReconnectLavalinkService {
    constructor(client) {
        this.client = client;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client.logger.info(AutoReconnectLavalinkService.name, `Setting up data for lavalink...`);
            this.client.logger.info(AutoReconnectLavalinkService.name, `Auto ReConnect Collecting player 24/7 data`);
            const maindata = yield this.client.db.autoreconnect.all();
            if (!maindata || maindata.length == 0) {
                this.client.logger.info(AutoReconnectLavalinkService.name, `Auto ReConnect found in 0 servers!`);
                this.client.logger.info(AutoReconnectLavalinkService.name, `Setting up data for lavalink complete!`);
                return;
            }
            this.client.logger.info(AutoReconnectLavalinkService.name, `Auto ReConnect found in ${Object.keys(maindata).length} servers!`);
            if (Object.keys(maindata).length === 0)
                return;
            let retry_interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (this.client.lavalinkUsing.length == 0 || this.client.rainlink.nodes.size == 0)
                    return this.client.logger.info(AutoReconnectLavalinkService.name, `No lavalink avalible, try again after 3 seconds!`);
                clearInterval(retry_interval);
                this.client.logger.info(AutoReconnectLavalinkService.name, `Lavalink avalible, remove interval and continue setup!`);
                chillout.forEach(maindata, (data) => __awaiter(this, void 0, void 0, function* () {
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () { return this.connectChannel(data); }));
                }));
                this.client.logger.info(AutoReconnectLavalinkService.name, `Reconnected to all ${Object.keys(maindata).length} servers!`);
                this.client.logger.info(AutoReconnectLavalinkService.name, `Setting up data for lavalink complete!`);
            }), 3000);
        });
    }
    connectChannel(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = yield this.client.channels.fetch(data.value.text).catch(() => undefined);
            const guild = yield this.client.guilds.fetch(data.value.guild).catch(() => undefined);
            const voice = (yield this.client.channels
                .fetch(data.value.voice)
                .catch(() => undefined));
            if (!channel || !voice) {
                this.client.logger.info(AutoReconnectLavalinkService.name, `The last voice/text channel that bot joined in guild [${data.value.guild}] is not found, skipping...`);
                return this.client.db.autoreconnect.delete(data.value.guild);
            }
            if (!data.value.twentyfourseven && voice.members.filter((m) => !m.user.bot).size == 0) {
                this.client.logger.info(AutoReconnectLavalinkService.name, `Guild [${data.value.guild}] have 0 members in last voice that bot joined, skipping...`);
                return this.client.db.autoreconnect.delete(data.value.guild);
            }
            const player = yield this.client.rainlink.create({
                guildId: data.value.guild,
                voiceId: data.value.voice,
                textId: data.value.text,
                shardId: guild ? guild.shardId : 0,
                deaf: true,
                volume: this.client.config.player.DEFAULT_VOLUME,
            });
            if (!this.client.config.utilities.AUTO_RESUME)
                return this.client.logger.info(AutoReconnectLavalinkService.name, `Auto resume disabled, now skipping all.`);
            if (data.value.current && data.value.current.length !== 0) {
                const search = yield player.search(data.value.current, {
                    requester: this.client.user,
                });
                if (!search.tracks.length)
                    return;
                if (data.value.queue.length !== 0)
                    yield this.queueDataPush(data.value.queue, player);
                if (data.value.previous.length !== 0)
                    yield this.previousDataPush(data.value.previous, player);
                if (data.value.config.loop !== "none")
                    player.setLoop(data.value.config.loop);
                yield player.play(search.tracks[0]);
            }
        });
    }
    queueDataPush(query, player) {
        return __awaiter(this, void 0, void 0, function* () {
            const SongAdd = [];
            let SongLoad = 0;
            for (const data of query) {
                const res = yield player.search(data, {
                    requester: this.client.user,
                });
                if (res.type == "TRACK") {
                    SongAdd.push(res.tracks[0]);
                    SongLoad++;
                }
                else if (res.type == "PLAYLIST") {
                    for (let t = 0; t < res.tracks.length; t++) {
                        SongAdd.push(res.tracks[t]);
                        SongLoad++;
                    }
                }
                else if (res.type == "SEARCH") {
                    SongAdd.push(res.tracks[0]);
                    SongLoad++;
                }
                if (SongLoad == query.length) {
                    player.queue.add(SongAdd);
                }
            }
        });
    }
    previousDataPush(query, player) {
        return __awaiter(this, void 0, void 0, function* () {
            const SongAdd = [];
            let SongLoad = 0;
            for (const data of query) {
                const res = yield player.search(data, {
                    requester: this.client.user,
                });
                if (res.type == "TRACK") {
                    SongAdd.push(res.tracks[0]);
                    SongLoad++;
                }
                else if (res.type == "PLAYLIST") {
                    for (let t = 0; t < res.tracks.length; t++) {
                        SongAdd.push(res.tracks[t]);
                        SongLoad++;
                    }
                }
                else if (res.type == "SEARCH") {
                    SongAdd.push(res.tracks[0]);
                    SongLoad++;
                }
                if (SongLoad == query.length) {
                    player.queue.previous.push(...SongAdd);
                }
            }
        });
    }
}
