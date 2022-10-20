<script lang="ts">
	import {Button, Checkbox, NumberInput, SettingItem, Switch, TextInput} from 'obsidian-svelte';
	import {InventoryGeneratorSettings} from './utils/Utils';
	import Icon from './utils/Icon.svelte';

	export let data: InventoryGeneratorSettings;
</script>

<style>
</style>

<div class="ttrpg-utilities-settings-group">
	<div class="ttrpg-utilities-row-flex">
		<h5 class="ttrpg-utilities-expand">Generator Segment</h5>
	</div>

</div>
