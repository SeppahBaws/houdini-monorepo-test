# houdini-lib-mode

This is a demo for [houdini-lib-mode](./houdini.plugin.js), a plugin that is currently _not_ published to npm.
Feel free to use it however you see fit, but I make no promises that this will get updated for future versions of Houdini.
In this example, the API url is hardcoded in the `src/api.js` file. You'll need to update [houdini.config.js](./houdini.config.js) and [`src/api.js`](./src/api.js) to match your API url.

## Usage

First, run `houdini:pull` to pull your schema. If you haven't already configured a GraphQL extension for your IDE, I highly recommend doing so.

Next, write your queries, fragments, mutations, and subscriptions in the `src/queries`, `src/fragments`, `src/mutations`, and `src/subscriptions` directories.

Finally, run `npm run build` to build your library. This will generate the `dist` directory, which has the svelte stores and needed types to leverage this library in your Svelte application(s).
