import npmlog from "npmlog";
import prettyjson from "prettyjson";

npmlog.addLevel("client", 2500, { fg: "brightRed" }, "Client");
npmlog.addLevel("event", 2500, { fg: "blue" }, "Events");
npmlog.addLevel("feat", 2500, { fg: "yellow" }, "Features");
npmlog.addLevel("api", 2500, { fg: "green" }, "API");

export default (prefix: string, mess: string, type?: "client" | "event" | "feat" | "api" | npmlog.LogLevels) => {
	npmlog.log(type ?? "info", `[${prefix}]`, mess);
};

process.on("uncaughtException", (error: Error) => {
	npmlog.log("error", `[${error.name}]`, prettyjson.render(error));
});

process.on("unhandledRejection", (error: Error) => {
	npmlog.log("error", `[${error.name}]`, prettyjson.render(error));
});
