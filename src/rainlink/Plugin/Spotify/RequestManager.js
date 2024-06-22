var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SpotifyRequest } from "./SpotifyRequest.js";
export class RequestManager {
    constructor(options) {
        var _a;
        this.options = options;
        this.requests = [];
        this.mode = "single";
        if ((_a = options.clients) === null || _a === void 0 ? void 0 : _a.length) {
            for (const client of options.clients)
                this.requests.push(new SpotifyRequest(client));
            this.mode = "multi";
            // eslint-disable-next-line no-console
            console.warn("\x1b[31m%s\x1b[0m", "You are using the multi client mode, sometimes you can STILL GET RATE LIMITED. I'm not responsible for any IP BANS.");
        }
        else {
            this.requests.push(new SpotifyRequest({
                clientId: options.clientId,
                clientSecret: options.clientSecret,
            }));
        }
    }
    makeRequest(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, disableBaseUri = false, tries = 3) {
            if (this.mode === "single")
                return this.requests[0].makeRequest(endpoint, disableBaseUri);
            const targetRequest = this.getLeastUsedRequest();
            if (!targetRequest)
                throw new Error("No available requests [ALL_RATE_LIMITED]");
            return targetRequest
                .makeRequest(endpoint, disableBaseUri)
                .catch((e) => e.message === "Rate limited by spotify" && tries
                ? this.makeRequest(endpoint, disableBaseUri, tries - 1)
                : Promise.reject(e));
        });
    }
    getLeastUsedRequest() {
        const targetSearch = this.requests.filter((request) => !request.stats.rateLimited);
        if (!targetSearch.length)
            return undefined;
        return targetSearch.sort((a, b) => a.stats.requests - b.stats.requests)[0];
    }
}
