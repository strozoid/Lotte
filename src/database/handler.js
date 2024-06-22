import { AutoReconnectLavalinkService } from "./setup/lavalink.js";
import { PremiumScheduleSetup } from "./setup/premium.js";
import { SongRequesterCleanSetup } from "./setup/setup.js";
export class Handler {
    constructor(client) {
        new SongRequesterCleanSetup(client);
        new AutoReconnectLavalinkService(client);
        new PremiumScheduleSetup(client);
    }
}
