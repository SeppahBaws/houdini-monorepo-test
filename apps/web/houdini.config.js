/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
	watchSchema: {
		url: 'https://rickandmortyapi.com/graphql'
	},
	runtimeDir: '.houdini',
	plugins: {
		'houdini-svelte': {},
		'@repo/ui': {}
	}
};

export default config;
