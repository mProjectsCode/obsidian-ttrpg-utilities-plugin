<script lang="ts">
	import {Button, Card, NumberInput, SettingItem, Slider, Switch, TextArea, TextInput} from 'obsidian-svelte';
	import {getUUID, InventoryGeneratorData} from './utils/Utils';
	import TableBuilderComponent from './tableBuilder/TableBuilderComponent.svelte';
	import InventoryGeneratorSettings from './InventoryGeneratorSettings.svelte';

	export let data: InventoryGeneratorData;
	export let generate: () => Promise<void>;

</script>

<style>

</style>

<div class="card" style="background: var(--background-secondary)">
	<h3>Inventory Generator</h3>
	<div class="ttrpg-utilities-row-flex">
		<h4 class="ttrpg-utilities-expand">Generator Settings</h4>
	</div>
	<div class="ttrpg-utilities-settings-group">
		<SettingItem
			name="Item Id Field"
			description="Specify a frontmatter field that uniquely identifies evey item">
			<TextInput bind:value={data.itemIdField}></TextInput>
		</SettingItem>
		<SettingItem
			name="Item Count"
			description="Set a maximum item count.">
			<NumberInput bind:value={data.generatorSettings.maxItems}></NumberInput>
		</SettingItem>
		<SettingItem
			name="Use Max Total Item Value"
			description="Set a maximum total item value.">
			<Switch bind:checked={data.generatorSettings.useMaxTotalValue}></Switch>
		</SettingItem>
		{#if data.generatorSettings.useMaxTotalValue}
			<SettingItem
				name="Item Value Field"
				description="">
				<TextInput bind:value={data.generatorSettings.itemValueField}></TextInput>
			</SettingItem>
			<SettingItem
				name="Item Value Distribution"
				description="">
				<Slider bind:value={data.generatorSettings.itemValueDistribution} min="0.1" max="1" step="0.1"></Slider>
			</SettingItem>
			<SettingItem
				name="Max Total Item Value"
				description="">
				<NumberInput bind:value={data.generatorSettings.maxTotalValue}></NumberInput>
			</SettingItem>
		{/if}
		<SettingItem
			name="Query Source"
			description={`Specify a query source using dataview syntax ("path/to/folder" or #tag).`}>
			<TextInput bind:value={data.generatorSettings.query}></TextInput>
		</SettingItem>
		<SettingItem
			name="Filter"
			description="Filter the items using javascript. The variable `items` is a dataview `DataArray<Record<string, Literal>>`.">
		</SettingItem>
		<TextArea bind:value={data.generatorSettings.filter} width="100%" rows="6"></TextArea>
	</div>
	<TableBuilderComponent data={data.tableBuilderData}></TableBuilderComponent>
	<Button on:click={() => console.log(data)}>log data</Button>
	<Button on:click={() => generate()}>generate</Button>
</div>
