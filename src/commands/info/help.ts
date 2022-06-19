import { Command } from "../../structures/Command";

export default new Command({
	enable: false,
	name: "help",
	description: "Help Command",
	run: async ({ interaction }) => {
		interaction.followUp("Hello World");
	},
});
