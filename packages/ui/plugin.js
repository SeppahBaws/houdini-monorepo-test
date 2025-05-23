import { plugin } from 'houdini';

export default plugin('@repo/ui', async () => {
	return {
		staticRuntime: './dist'
	};
});
