import {App, MarkdownRenderChild, parseYaml} from 'obsidian';
import InventoryGenerator from './InventoryGenerator.svelte';
import TTRPGUtilitiesPlugin from './main';

export class InventoryGeneratorMarkdownRenderChild extends MarkdownRenderChild {
	plugin: TTRPGUtilitiesPlugin;
	fullDeclaration: string;
	values: any;


	constructor(containerEl: HTMLElement, plugin: TTRPGUtilitiesPlugin, fullDeclaration: string) {
		super(containerEl);
		this.plugin = plugin;
		this.fullDeclaration = fullDeclaration;

		this.parseDeclaration();
	}

	parseDeclaration() {
		this.values = parseYaml(this.fullDeclaration);
		console.log('values', this.values);
	}

	saveDeclaration() {

	}

	public onload(): void {
		new InventoryGenerator({
			target: this.containerEl,
			props: {

			}
		});
	}
}
