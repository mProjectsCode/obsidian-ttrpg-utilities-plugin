import { MarkdownRenderChild } from 'obsidian';
import InventoryGenerator from './InventoryGenerator.svelte';
import TTRPGUtilitiesPlugin from './main';
import { getDefaultInventoryGeneratorData, InventoryGeneratorData } from './utils/Utils';
import { DataArray, DataviewApi, Literal } from 'obsidian-dataview';
import { createTable } from './tableBuilder/TableBuilder';

type DvArray = Record<string, Literal>[];

export class InventoryGeneratorMarkdownRenderChild extends MarkdownRenderChild {
	plugin: TTRPGUtilitiesPlugin;
	fullDeclaration: string;
	data: InventoryGeneratorData;
	file: string;

	tableContainer: HTMLElement;

	constructor(containerEl: HTMLElement, plugin: TTRPGUtilitiesPlugin, fullDeclaration: string, file: string) {
		super(containerEl);
		this.plugin = plugin;
		this.fullDeclaration = fullDeclaration;
		this.file = file;

		this.loadData();
	}

	getId(): string {
		return this.fullDeclaration.replace(/( |\n)/g, '');
	}

	loadData() {
		this.data = this.plugin.settings.inventoryGeneratorData.find(x => x.id === this.getId()) ?? getDefaultInventoryGeneratorData();
		this.data.id = this.getId();
	}

	saveData() {
		this.plugin.settings.inventoryGeneratorData = this.plugin.settings.inventoryGeneratorData.filter(x => x.id !== this.getId());
		this.plugin.settings.inventoryGeneratorData.push(this.data);
		this.plugin.saveSettings();
	}

	async generateInventory() {
		const dv: DataviewApi = this.plugin.dataview;

		const items: DataArray<Record<string, Literal>> = dv.pages(this.data.generatorSettings.query);

		let filter = this.data.generatorSettings.filter;
		if (filter.contains('await')) filter = '(async () => { ' + filter + ' })()';
		const func = new Function('items', filter);
		const filteredItemsDataArray: DataArray<Record<string, Literal>> = await Promise.resolve(func(items));
		let filteredItemsArray: DvArray = filteredItemsDataArray.array();

		console.log('out', filteredItemsArray);
		if (this.data.generatorSettings.useMaxTotalValue) {
			filteredItemsArray = filteredItemsArray.filter(x => {
				if (!x[this.data.itemIdField]) {
					return false;
				}
				if (!x[this.data.generatorSettings.itemValueField]) {
					return false;
				}

				return true;
			});

			const { randomItems, totalValue } = this.selectRandomItemsWithMaxTotalValue(
				filteredItemsArray,
				this.data.generatorSettings.maxTotalValue,
				this.data.generatorSettings.maxItems
			);

			this.createTable(randomItems);
			this.tableContainer.createEl('span', { text: `Total Value: ${totalValue}` });
		} else {
			filteredItemsArray = filteredItemsArray.filter(x => {
				if (!x[this.data.itemIdField]) {
					return false;
				}

				return true;
			});

			const { randomItems, totalValue } = this.selectRandomItems(filteredItemsArray, this.data.generatorSettings.maxItems);

			this.createTable(randomItems);
			this.tableContainer.createEl('span', { text: `Total Value: ${totalValue}` });
		}
	}

	createTable(data: any[] | DataArray<any>): void {
		this.tableContainer.empty();
		createTable(this.data.tableBuilderData, data, this.tableContainer);
	}

	selectRandomItems(data: DvArray, maxItems: number): { randomItems: DvArray; totalValue: number } {
		let totalValue = 0;
		const randomItems: DvArray = [];

		while (randomItems.length < maxItems) {
			const item: Record<string, Literal> = this.getRandomItem(data);

			randomItems.push(item);
			totalValue += item[this.data.generatorSettings.itemValueField];
		}

		console.log(randomItems);
		return { randomItems, totalValue };
	}

	selectRandomItemsWithMaxTotalValue(dataArray: DvArray, maxValue: number, maxItems: number): { randomItems: DvArray; totalValue: number } {
		const valueWeight = this.data.generatorSettings.itemValueDistribution;
		const leniency = 0.5;

		let totalValue = 0;
		const randomItems: DvArray = [];

		while (randomItems.length < maxItems) {
			const remainingValue = maxValue - totalValue;
			// on the last item use the full remaining value as the target value
			const targetValue = randomItems.length < maxItems - 1 ? remainingValue * valueWeight : remainingValue;

			const items = this.filterByValue(dataArray, targetValue, leniency);
			if (items.length === 0) {
				console.warn('No item found with target value', targetValue);
				break;
			}

			const item: Record<string, Literal> = this.getWeightedRandomItem(items, targetValue);

			randomItems.push(item);
			totalValue += item[this.data.generatorSettings.itemValueField];
		}

		console.log(randomItems);
		return { randomItems, totalValue };
	}

	filterByValue(dataArray: DvArray, value: number, leniency: number): DvArray {
		return dataArray.filter(x => this.isInBetween(x[this.data.generatorSettings.itemValueField], value - value * leniency, value + value * leniency));
	}

	isInBetween(value: number, min: number, max: number) {
		return value <= max && value >= min;
	}

	getRandomItem(dataArray: DvArray): Record<string, Literal> {
		return dataArray[Math.floor(Math.random() * dataArray.length)];
	}

	getWeightedRandomItem(data: DvArray, centerValue: number): Record<string, Literal> {
		const entries: { id: string; value: number; weight: number; comWeightStart: number }[] = [];
		let comWeight = 0;

		for (const d of data) {
			const id: string = d[this.data.itemIdField];
			const value: number = d[this.data.generatorSettings.itemValueField];
			const weight: number = this.bellCurveFast((value - centerValue) / centerValue);
			const comWeightStart = comWeight;
			comWeight += weight;

			entries.push({
				id,
				value,
				weight,
				comWeightStart,
			});
		}

		// console.log(entries);

		const randomValue = Math.random() * comWeight;

		for (let i = 0; i < entries.length; i++) {
			if (entries[i].comWeightStart > randomValue) {
				const retData = data.find(x => x[this.data.itemIdField] === entries[i].id);
				if (!retData) {
					throw new Error();
				}
				return retData;
			}
		}

		return data[Math.floor(Math.random() * data.length)];
	}

	bellCurveFast(x: number): number {
		const a = 0.3;
		return 1 / (1 + Math.pow(x * (1 / a), 4));
	}

	public onload(): void {
		new InventoryGenerator({
			target: this.containerEl,
			props: {
				data: this.data,
				generate: () => this.generateInventory(),
				save: () => this.saveData(),
			},
		});

		this.tableContainer = this.containerEl.createDiv();
	}
}
