import { Event } from "../structures/Event";
import log from "../util/logger";

export default new Event("ready", () => {
	log("ready", "Bot is online", "event");
});
