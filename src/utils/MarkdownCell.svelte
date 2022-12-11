<script lang="ts">
	import {isMdLink, MarkdownLink, parseMdLink} from './MarkdownLinkParser';
	import LinkComponent from './LinkComponent.svelte';

	export let value: string = '';

	let mdLink: MarkdownLink | string;

	function parseLink(): boolean {
		try {
			mdLink = parseMdLink(value);
			return true;
		} catch (e) {
			mdLink = e instanceof Error ? e.message : e;
			return false;
		}
	}
</script>

{#if isMdLink(value)}
	{#if parseLink()}
		<LinkComponent mdLink={mdLink}></LinkComponent>
	{:else}
		<span class="mod-error">{value}</span>
	{/if}
{:else}
	<span>{value}</span>
{/if}
