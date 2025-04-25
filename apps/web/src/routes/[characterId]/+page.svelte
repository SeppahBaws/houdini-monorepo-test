<script lang="ts">
	import { page } from '$app/state';
	import { CharacterCard } from '@repo/ui';
</script>

<CharacterCard id={page.params.characterId} />
