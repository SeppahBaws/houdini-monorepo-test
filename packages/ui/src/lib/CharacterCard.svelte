<script lang="ts">
	import { CharacterCardStore } from '@repo/ui-queries';
	import { onMount } from 'svelte';

	// import type { CharacterCardVariables } from './$houdini';

	interface Props {
		id: string;
	}
	let { id }: Props = $props();

	let characterInfo = new CharacterCardStore();

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
