import { App, PluginSettingTab } from 'obsidian';
import TTRPGUtilitiesPlugin from '../main';
import { InventoryGeneratorData } from '../utils/Utils';

export interface TTRPGUtilitiesSettings {
	inventoryGeneratorData: InventoryGeneratorData[];
}

export const DEFAULT_SETTINGS: TTRPGUtilitiesSettings = {
	inventoryGeneratorData: [],
};

export class SampleSettingTab extends PluginSettingTab {
	plugin: TTRPGUtilitiesPlugin;

	constructor(app: App, plugin: TTRPGUtilitiesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });
	}
}
