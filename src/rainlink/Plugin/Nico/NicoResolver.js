// Code from:
// https://github.com/y-chan/niconico-dl.js
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parse } from "node-html-parser";
import { fetch } from "undici";
const niconicoRegexp = RegExp(
// https://github.com/ytdl-org/youtube-dl/blob/a8035827177d6b59aca03bd717acb6a9bdd75ada/youtube_dl/extractor/niconico.py#L162
"https?://(?:www\\.|secure\\.|sp\\.)?nicovideo\\.jp/watch/(?<id>(?:[a-z]{2})?[0-9]+)");
export function isValidURL(url) {
    return niconicoRegexp.test(url);
}
class NiconicoDL {
    constructor(url) {
        if (!isValidURL(url)) {
            throw Error("Invalid url");
        }
        this.videoURL = url;
    }
    getVideoInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchSite = yield fetch(this.videoURL);
            const rawStringText = yield fetchSite.text();
            const videoSiteDom = parse(rawStringText);
            const matchResult = videoSiteDom
                .querySelectorAll("div")
                .filter((a) => a.rawAttributes.id === "js-initial-watch-data");
            if (matchResult.length === 0) {
                throw Error("Failed get video site html...");
            }
            const patterns = {
                "&lt;": "<",
                "&gt;": ">",
                "&amp;": "&",
                "&quot;": '"',
                "&#x27;": "'",
                "&#x60;": "`",
            };
            const fixedString = matchResult[0].rawAttributes["data-api-data"].replace(/&(lt|gt|amp|quot|#x27|#x60);/g, function (match) {
                return patterns[match];
            });
            this.data = JSON.parse(fixedString);
            return Object.assign(this.data.video, {
                owner: this.data.owner,
            });
        });
    }
}
export default NiconicoDL;
