import { ClassClient } from "./structures/Client";
import dotenv from "dotenv";
dotenv.config();

export const client = new ClassClient();
client.start();
