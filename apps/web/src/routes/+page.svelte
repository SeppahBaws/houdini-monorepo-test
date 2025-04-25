<script lang="ts">
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { AllCharacters } = $derived(data);
</script>

<h1>List of all the characters:</h1>
{#if $AllCharacters.data}
	{#each $AllCharacters.data.characters.results as character}
		<p>{character.name}</p>
	{/each}
{/if}
