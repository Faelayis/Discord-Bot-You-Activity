import { Api } from "../types/api/valorant";
import log from "../util/logger";
import axios from "axios";

export default async (params: Api) => {
	log("Valorant", `Processing .. \nuser: ${params.username}#${params.tagline}`, "api");
	const api = await axios.get(`https://api.henrikdev.xyz/valorant/${params.version}/${params.get}/${params.region}/${params.username}/${params.tagline}`).then((res) => res.data);

	return api.data || null;
};
