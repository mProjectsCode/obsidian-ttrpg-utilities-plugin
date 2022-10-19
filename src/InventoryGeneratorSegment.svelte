<script lang="ts">
	import {Button, Checkbox, NumberInput, SettingItem, Switch, TextInput} from 'obsidian-svelte';
	import {InventoryGeneratorSegmentData} from './utils/Utils';
	import Icon from './utils/Icon.svelte';

	export let data: InventoryGeneratorSegmentData;
	export let removeSegment: (id: string) => void;
</script>

<style>

</style>

<div class="ttrpg-settings-group">
	<div class="ttrpg-utilities-row-flex">
		<h5 class="ttrpg-utilities-expand">Generator Segment</h5>
		<Button on:click={() => removeSegment(data.id)} variant="destructive"  tooltip="Remove Generator Segment"><Icon iconName="x"></Icon></Button>
	</div>
	<SettingItem name="Query" description="The Query">
		<TextInput bind:value={data.query}></TextInput>
	</SettingItem>
	<SettingItem name="Filter" description="">
		<TextInput bind:value={data.filter}></TextInput>
	</SettingItem>
	<SettingItem name="Item Count" description="">
		<NumberInput bind:value={data.maxItems}></NumberInput>
	</SettingItem>
	<SettingItem name="Use Max Total Item Value" description="">
		<Switch bind:checked={data.useMaxTotalValue}></Switch>
	</SettingItem>
	{#if data.useMaxTotalValue}
		<SettingItem name="Max Total Item Value" description="">
			<NumberInput bind:value={data.maxTotalValue}></NumberInput>
		</SettingItem>
	{/if}
</div>
