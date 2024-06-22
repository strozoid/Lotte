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
export class SongRequesterCleanSetup {
    constructor(client) {
        this.client = client;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const guilds = yield this.client.db.setup.all();
            for (let data of guilds) {
                const extractData = data.value;
                const player = this.client.rainlink.players.get(extractData.guild);
                if (!extractData.enable)
                    return;
                if (player)
                    return;
                yield this.restore(extractData);
            }
        });
    }
    restore(setupData) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = (yield this.client.channels
                .fetch(setupData.channel)
                .catch(() => undefined));
            if (!channel)
                return;
            let playMsg = yield channel.messages.fetch(setupData.playmsg).catch(() => undefined);
            if (!playMsg)
                return;
            let guildModel = yield this.client.db.language.get(`${setupData.guild}`);
            if (!guildModel) {
                guildModel = yield this.client.db.language.set(`${setupData.guild}`, this.client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            const queueMsg = `${this.client.i18n.get(language, "setup", "setup_queuemsg")}`;
            const playEmbed = new EmbedBuilder()
                .setColor(this.client.color)
                .setAuthor({
                name: `${this.client.i18n.get(language, "setup", "setup_playembed_author")}`,
            })
                .setImage(`https://cdn.discordapp.com/avatars/${this.client.user.id}/${this.client.user.avatar}.jpeg?size=300`);
            return yield playMsg
                .edit({
                content: `${queueMsg}`,
                embeds: [playEmbed],
                components: [this.client.diSwitch],
            })
                .catch((e) => { });
        });
    }
}
