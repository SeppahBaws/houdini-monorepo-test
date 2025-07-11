/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
    "watchSchema": {
        "url": "https://rickandmortyapi.com/graphql"
    },
    include: ["src/queries/**/*.{gql,graphql}", "src/fragments/**/*.{gql,graphql}", "src/mutations/**/*.{gql,graphql}", "src/subscriptions/**/*.{gql,graphql}"],
    runtimeDir: "src/houdini",
    "plugins": {
        "./houdini.plugin.js": {
            outfile: "./src/index.js"
        },
        "houdini-svelte": {
            client: "./src/api.js",
            framework: "svelte",
            static: true,
        },
    },
}

export default config
