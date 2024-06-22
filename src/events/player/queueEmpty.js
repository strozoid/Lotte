var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AutoReconnectBuilderService } from "../../services/AutoReconnectBuilderService.js";
import { ClearMessageService } from "../../services/ClearMessageService.js";
import { RainlinkPlayerState } from "../../rainlink/main.js";
export default class {
    execute(client, player) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.isDatabaseConnected)
                return client.logger.warn("DatabaseService", "The database is not yet connected so this event will temporarily not execute. Please try again later!");
            /////////// Update Music Setup //////////
            yield client.UpdateMusic(player);
            /////////// Update Music Setup ///////////
            const guild = yield client.guilds.fetch(player.guildId).catch(() => undefined);
            if (player.data.get("autoplay") === true) {
                const author = player.data.get("author");
                const title = player.data.get("title");
                const requester = player.data.get("requester");
                let identifier = player.data.get("identifier");
                const source = String(player.data.get("source"));
                if (source.toLowerCase() !== "youtube") {
                    const findQuery = "directSearch=ytsearch:" + [author, title].filter((x) => !!x).join(" - ");
                    const preRes = yield player.search(findQuery, { requester: requester });
                    if (preRes.tracks.length !== 0)
                        true;
                    preRes.tracks[0].identifier ? (identifier = preRes.tracks[0].identifier) : true;
                }
                const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
                let res = yield player.search(search, { requester: requester });
                const finalRes = res.tracks.filter((track) => {
                    const req1 = !player.queue.some((s) => s.encoded === track.encoded);
                    const req2 = !player.queue.previous.some((s) => s.encoded === track.encoded);
                    return req1 && req2;
                });
                if (finalRes.length !== 0) {
                    player.play(finalRes.length <= 1 ? finalRes[0] : finalRes[1]);
                    const channel = (yield client.channels
                        .fetch(player.textId)
                        .catch(() => undefined));
                    if (channel)
                        return new ClearMessageService(client, channel, player);
                    return;
                }
            }
            client.logger.info("QueueEmpty", `Queue Empty in @ ${guild.name} / ${player.guildId}`);
            const data = yield new AutoReconnectBuilderService(client, player).get(player.guildId);
            const channel = (yield client.channels
                .fetch(player.textId)
                .catch(() => undefined));
            if (data !== null && data && data.twentyfourseven && channel)
                new ClearMessageService(client, channel, player);
            if (player.state !== RainlinkPlayerState.DESTROYED)
                yield player.destroy().catch(() => { });
        });
    }
}
