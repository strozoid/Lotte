// Code from:
// https://github.com/blackrose514/niconico-search-api
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { responseFields } from "./NicoSearchConst.js";
import { fetch } from "undici";
const apiUrl = "https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search";
export default function search(_a) {
    return __awaiter(this, arguments, void 0, function* ({ q, fields, }) {
        if (fields === "*") {
            fields = responseFields;
        }
        try {
            const url = new URL(apiUrl);
            url.search = new URLSearchParams({
                q,
                targets: "tagsExact",
                fields: "contentId",
                sort: "-viewCounter",
                limit: String(10),
            }).toString();
            const req = yield fetch(url);
            const res = (yield req.json());
            return res;
        }
        catch (err) {
            if (err === null || err === void 0 ? void 0 : err.response) {
                const { meta } = err.response;
                throw {
                    name: "NiconicoSearchAPIResponseError",
                    meta,
                };
            }
            throw err;
        }
    });
}
