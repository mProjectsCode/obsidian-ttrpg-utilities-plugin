<script lang="ts">
	import {TableBuilderData} from './TableBuilder';
	import {Button, SettingItem, TextInput} from 'obsidian-svelte';
	import {getUUID} from '../utils/Utils';
	import Icon from '../utils/Icon.svelte';

	export let data: TableBuilderData;

	let columnCounter = 1;

	function addColumn() {
		data.columns.push({
			id: getUUID(),
			name: `Column ${columnCounter}`,
			data: '',
		})
		columnCounter += 1;
		data = data;
	}

	function deleteColumn(id: string) {
		data.columns = data.columns.filter(x => x.id !== id);
	}
</script>

<style></style>

<div>
	<div class="ttrpg-utilities-row-flex">
		<h4 class="ttrpg-utilities-expand">Table Builder</h4>
		<Button on:click={() => addColumn()} variant="primary" tooltip="Add Column"><Icon iconName="plus"></Icon></Button>
	</div>

	<div>
		{#each data.columns as column}
			<div  class="ttrpg-settings-group">
				<div class="ttrpg-utilities-row-flex">
					<h5 class="ttrpg-utilities-expand">{column.name}</h5>
					<Button on:click={() => deleteColumn(column.id)} variant="destructive"  tooltip="Delete Column"><Icon iconName="x"></Icon></Button>
				</div>
				<SettingItem name="Name">
					<TextInput bind:value={column.name}></TextInput>
				</SettingItem>
				<SettingItem name="Data">
					<TextInput bind:value={column.data} placeholder={`\$\{item.${column.name}\}`}></TextInput>
				</SettingItem>
			</div>
		{/each}
	</div>
</div>
