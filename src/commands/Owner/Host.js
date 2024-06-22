var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, version } from "discord.js";
import { Accessableby } from "../../structures/Command.js";
import os from "os";
import ms from "pretty-ms";
import { stripIndents } from "common-tags";
export default class {
    constructor() {
        this.name = ["host"];
        this.description = "Show the host infomation/status!";
        this.category = "Owner";
        this.accessableby = [Accessableby.Owner];
        this.usage = "";
        this.aliases = [];
        this.lavalink = false;
        this.usingInteraction = false;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const total = os.totalmem() / 1024 / 1024;
            const used = process.memoryUsage().rss / 1024 / 1024;
            const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
            const heapTotal = process.memoryUsage().heapUsed / 1024 / 1024;
            const hostInfo = stripIndents `\`\`\`
    - OS: ${os.type()} ${os.release()} (${os.arch()})
    - CPU: ${os.cpus()[0].model}
    - Uptime: ${ms(client.uptime)}
    - RAM: ${(total / 1024).toFixed(2)} GB
    - Memory Usage: ${used.toFixed(2)}/${total.toFixed(2)} (MB)
    - ├── RSS: ${used.toFixed(2)} MB
    - ├── Used Heap: ${heapUsed.toFixed(2)} MB
    - ├── Total Heap: ${heapTotal.toFixed(2)} MB
    - ├── Heap Usage: ${((heapUsed / heapTotal) * 100).toFixed(2)}%
    - └── External: ${(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB
    - Node.js: ${process.version}
    \`\`\``;
            const botInfo = stripIndents `\`\`\`
    - Codename: ${client.metadata.codename}
    - Bot version: ${client.metadata.version}
    - Autofix version: ${client.metadata.autofix}
    - Discord.js: ${version}
    - WebSocket Ping: ${client.ws.ping}ms
    - Guild Count: ${client.guilds.cache.size}
    - User count: ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
    \`\`\``;
            const embed = new EmbedBuilder()
                .setAuthor({
                name: client.user.tag + " Host Status",
                iconURL: String(client.user.displayAvatarURL({ size: 2048 })),
            })
                .setColor(client.color)
                .addFields({ name: "Host info", value: hostInfo }, { name: "Bot info", value: botInfo })
                .setTimestamp();
            handler.editReply({ embeds: [embed] });
        });
    }
}
