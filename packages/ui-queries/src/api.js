//@ts-ignore This file frequently gets generated after the fact
import { HoudiniClient } from "./houdini/index.js";

export const api = new HoudiniClient({
    url: "https://rickandmortyapi.com/graphql",
})

export default api;

