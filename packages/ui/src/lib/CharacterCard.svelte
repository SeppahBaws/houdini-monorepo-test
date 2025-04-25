<script lang="ts">
	import { graphql } from '$houdini';
	import type { CharacterCardVariables } from './$houdini';

	interface Props {
		id: string;
	}
	let { id }: Props = $props();

	let characterInfo = $derived(
		graphql(`
			query CharacterCard($characterId: ID!) @load {
				character(id: $characterId) {
					name
					status
					image
				}
			}
		`)
	);

	export const _CharacterCardVariables: CharacterCardVariables = ({ props }: { props: Props }) => {
		return {
			characterId: props.id
		};
	};
</script>

{#if $characterInfo.data}
	<div>
		<img src={$characterInfo.data.character?.image} width="100px" alt="" />
		<p>name: {$characterInfo.data.character?.name}</p>
		<p>status: {$characterInfo.data.character?.status}</p>
	</div>
{/if}
