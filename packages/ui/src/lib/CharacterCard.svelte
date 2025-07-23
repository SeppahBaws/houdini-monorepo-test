<script lang="ts">
	import { CharacterCardQueryStore } from '$houdini';

	interface Props {
		id: string;
	}
	let { id }: Props = $props();

	const characterInfo = new CharacterCardQueryStore();

	$effect(() => {
		characterInfo.fetch({
			variables: {
				characterId: id
			}
		});
	});
</script>

{#if $characterInfo.data}
	<div>
		<img src={$characterInfo.data.character?.image} width="100px" alt="" />
		<p>name: {$characterInfo.data.character?.name}</p>
		<p>status: {$characterInfo.data.character?.status}</p>
	</div>
{/if}
