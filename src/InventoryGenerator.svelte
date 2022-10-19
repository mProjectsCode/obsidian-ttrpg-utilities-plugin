<script lang="ts">
	import {Button, Card, SettingItem, TextInput} from 'obsidian-svelte';
	import InventoryGeneratorSegment from './InventoryGeneratorSegment.svelte';
	import {getUUID, InventoryGeneratorData} from './utils/Utils';
	import TableBuilderComponent from './tableBuilder/TableBuilderComponent.svelte';
	import Icon from './utils/Icon.svelte';

	export let data: InventoryGeneratorData;
	export let generate: () => Promise<void>;

	function addSegment() {
		data.generatorSegmentData.push({
			id: getUUID(),
			filter: 'return items;',
			maxItems: 10,
			useMaxTotalValue: false,
			maxTotalValue: 10000,
			query: '',
		});
		data = data;
	}

	function removeSegment(id: string) {
		data.generatorSegmentData = data.generatorSegmentData.filter(x => x.id !== id);
	}

</script>

<style>

</style>

<div class="card" style="background: var(--background-secondary)">
	<Button on:click={() => console.log(data)}>log data</Button>
	<Button on:click={() => generate()}>generate</Button>
	<h3>Inventory Generator</h3>
	<div>
		<SettingItem name="Item Id Field">
			<TextInput bind:value={data.itemIdField}></TextInput>
		</SettingItem>
	</div>
	<div>
		<div class="ttrpg-utilities-row-flex">
			<h4 class="ttrpg-utilities-expand">Generator Segments</h4>
			<Button on:click={() => addSegment()} variant="primary" tooltip="Add Generator Segment"><Icon iconName="plus"></Icon></Button>
		</div>
		{#each data.generatorSegmentData as segment}
			<InventoryGeneratorSegment data={segment} removeSegment={removeSegment}></InventoryGeneratorSegment>
		{/each}
	</div>
	<TableBuilderComponent data={data.tableBuilderData}></TableBuilderComponent>
</div>
