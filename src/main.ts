import {Editor, MarkdownView, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, SampleSettingTab, TTRPGUtilitiesSettings} from './settings/TTRPGUtilitiesSettings';
import {DataviewApi, getAPI} from 'obsidian-dataview';
import {InventoryGeneratorMarkdownRenderChild} from './InventoryGeneratorMarkdownRenderChild';
import {initUUIDGen} from './utils/Utils';

// Remember to rename these classes and interfaces!

export default class TTRPGUtilitiesPlugin extends Plugin {
	settings: TTRPGUtilitiesSettings;
	dataview: DataviewApi;

	async onload() {
		initUUIDGen();

		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: async () => {
				let content = 'console.log(a); return a + 1;';
				let func = new Function("a", content);
				let result = await Promise.resolve(func(5));
				console.log('out', result);
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});

		this.registerMarkdownCodeBlockProcessor('ttu-loot-gen', (source, el, ctx) => {
			ctx.addChild(new InventoryGeneratorMarkdownRenderChild(
				el,
				this,
				source,
				ctx.sourcePath
			));
		})

		this.app.workspace.onLayoutReady(() => {
			const dataviewAPI = getAPI(app);
			if (!dataviewAPI) {
				new Notice('TTU | ERROR: no dataview found');
			} else {
				this.dataview = dataviewAPI;
				console.log(this.dataview);
			}
		})

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
