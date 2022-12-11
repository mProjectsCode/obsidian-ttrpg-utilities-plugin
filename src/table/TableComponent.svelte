<script lang="ts">
	import {TableBuilderData} from '../tableBuilder/TableBuilder';
	import {DataArray} from 'obsidian-dataview';
	import {renderString} from '../utils/Utils';
	import MarkdownCell from '../utils/MarkdownCell.svelte';

	export let tableBuilderData: TableBuilderData;
 	export let tableContent: any[] | DataArray<any>;
</script>

<style>

</style>

<table>
	<thead>
	<tr>
		{#each tableBuilderData.columns as column}
			<td>{column.name}</td>
		{/each}
	</tr>
	</thead>
	<tbody>
		{#each tableContent as content}
			<tr>
				{#each tableBuilderData.columns as column}
					<td><MarkdownCell value={renderString(column.data, { item: content })}></MarkdownCell></td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
