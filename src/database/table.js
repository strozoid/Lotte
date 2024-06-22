var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Handler } from "./handler.js";
import { QuickDatabasePlus } from "../structures/QuickDatabasePlus.js";
export class TableSetup {
    constructor(client, driver, driverName) {
        this.client = client;
        this.driver = driver;
        this.driverName = driverName;
        this.register();
    }
    register() {
        return __awaiter(this, void 0, void 0, function* () {
            const baseDB = new QuickDatabasePlus(this.client.config.utilities.DATABASE.cacheCleanSchedule, {
                driver: this.driver,
            });
            const start = Date.now();
            yield baseDB.init();
            const end = Date.now();
            this.client.logger.info("DatabaseService", `Connected to the database! [${this.driverName}] [${end - start}ms]`);
            this.client.db = {
                autoreconnect: yield baseDB.table("autoreconnect"),
                playlist: yield baseDB.table("playlist"),
                code: yield baseDB.table("code"),
                premium: yield baseDB.table("premium"),
                setup: yield baseDB.table("setup"),
                language: yield baseDB.table("language"),
                prefix: yield baseDB.table("prefix"),
                songNoti: yield baseDB.table("songNoti"),
                preGuild: yield baseDB.table("preGuild"),
            };
            this.client.isDatabaseConnected = true;
            new Handler(this.client);
        });
    }
}
