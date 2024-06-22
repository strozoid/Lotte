import { PlayerContentLoader } from "./Player/loadContent.js";
import { PlayerEventLoader } from "./Player/loadEvent.js";
import { PlayerSetupLoader } from "./Player/loadSetup.js";
import { PlayerUpdateLoader } from "./Player/loadUpdate.js";
export class PlayerLoader {
    constructor(client) {
        new PlayerEventLoader(client);
        new PlayerContentLoader(client);
        new PlayerUpdateLoader(client);
        new PlayerSetupLoader(client);
    }
}
