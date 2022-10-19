import {MarkdownRenderChild, parseYaml} from 'obsidian';
import InventoryGenerator from './InventoryGenerator.svelte';
import TTRPGUtilitiesPlugin from './main';
import {getUUID, InventoryGeneratorData, InventoryGeneratorMode} from './utils/Utils';
import {DataArray, DataviewApi, Literal} from 'obsidian-dataview';
import {type} from 'os';
import {createTable} from './tableBuilder/TableBuilder';

export class InventoryGeneratorMarkdownRenderChild extends MarkdownRenderChild {
	plugin: TTRPGUtilitiesPlugin;
	fullDeclaration: string;
	data: InventoryGeneratorData;
	file: string;

	constructor(containerEl: HTMLElement, plugin: TTRPGUtilitiesPlugin, fullDeclaration: string, file: string) {
		super(containerEl);
		this.plugin = plugin;
		this.fullDeclaration = fullDeclaration;
		this.file = file;

		this.data = {
			id: getUUID(),
			itemIdField: 'id',
			mode: InventoryGeneratorMode.GENERATOR,
			tableBuilderData: {
				columns: [
					{
						id: getUUID(),
						name: 'File',
						data: '${item.file.link}'
					}
				]
			},
			generatedInventory: [],
			generatorSegmentData: [],
		}

		this.parseDeclaration();
	}

	parseDeclaration() {

	}

	saveDeclaration() {

	}

	async generateInventory() {
		const dv: DataviewApi = this.plugin.dataview;

		for (const segmentData of this.data.generatorSegmentData) {
			let items: DataArray<Record<string, Literal>> = dv.pages(segmentData.query);

			let filter = segmentData.filter;
			if (filter.contains("await")) filter = "(async () => { " + filter + " })()";
			let func = new Function("items", filter);
			let result: DataArray<Record<string, Literal>> = await Promise.resolve(func(items));

			console.log('out', result);
			console.log('typeof result', typeof result);
			console.log('typeof items', typeof items);

			//await dv.table(["File"], result.map(x => [x.file.link]), this.containerEl, this, this.file);
			await createTable(this.data.tableBuilderData, result, this.containerEl, this, this.file)
		}
	}

	public onload(): void {
		new InventoryGenerator({
			target: this.containerEl,
			props: {
				data: this.data,
				generate: () => this.generateInventory(),
			}
		});
	}
}
