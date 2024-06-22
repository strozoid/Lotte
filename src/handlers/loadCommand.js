import { CommandLoader } from "./Commands/loadCommands.js";
import { PlayerButtonsLoader } from "./Commands/loadPlayerButtons.js";
export class CommandAndButtonLoader {
    constructor(client) {
        new PlayerButtonsLoader(client);
        new CommandLoader(client);
    }
}
