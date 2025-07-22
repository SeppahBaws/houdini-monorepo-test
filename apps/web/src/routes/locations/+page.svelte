<script lang="ts">
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { LocationsList } = $derived(data);
</script>

{#if $LocationsList.data}
	<ul>
		{#each $LocationsList.data.locations?.results ?? [] as location}
			{#if location}
				<li>{location.name} ({location.type}) - dimension: {location.dimension}</li>
			{/if}
		{/each}
	</ul>
{/if}
