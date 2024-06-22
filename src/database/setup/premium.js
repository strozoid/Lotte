var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cron from "node-cron";
export class PremiumScheduleSetup {
    constructor(client) {
        this.client = client;
        this.execute();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setupChecker();
            cron.schedule("0 */1 * * * *", () => this.setupChecker());
        });
    }
    setupChecker() {
        return __awaiter(this, void 0, void 0, function* () {
            const premium = Array.from(yield this.client.db.premium.all());
            const users = premium.filter((data) => data.value.isPremium == true && data.value.expiresAt !== "lifetime");
            if (users && users.length !== 0)
                this.checkUser(users.map((data) => data.value));
            const premiumGuild = Array.from(yield this.client.db.premium.all());
            const guilds = premiumGuild.filter((data) => data.value.isPremium == true && data.value.expiresAt !== "lifetime");
            if (guilds && guilds.length !== 0)
                this.checkGuild(guilds.map((data) => data.value));
        });
    }
    checkUser(users) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let data of users) {
                if (data.expiresAt !== "lifetime" && Date.now() >= data.expiresAt) {
                    yield this.client.db.premium.delete(data.id);
                }
            }
        });
    }
    checkGuild(users) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let data of users) {
                if (data.expiresAt !== "lifetime" && Date.now() >= data.expiresAt) {
                    yield this.client.db.premium.delete(data.id);
                }
            }
        });
    }
}
