<script lang="ts">
	import { page } from '$app/state';
	import { CharacterCard } from '$houdini';
</script>

<CharacterCard id={page.params.characterId} />
