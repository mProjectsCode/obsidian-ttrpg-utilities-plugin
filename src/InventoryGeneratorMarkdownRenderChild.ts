import {MarkdownRenderChild} from 'obsidian';
import InventoryGenerator from './InventoryGenerator.svelte';
import TTRPGUtilitiesPlugin from './main';
import {getDefaultInventoryGeneratorData, getUUID, InventoryGeneratorData, InventoryGeneratorMode} from './utils/Utils';
import {DataArray, DataviewApi, Literal} from 'obsidian-dataview';
import {createTable} from './tableBuilder/TableBuilder';

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

		let items: DataArray<Record<string, Literal>> = dv.pages(this.data.generatorSettings.query);

		let filter = this.data.generatorSettings.filter;
		if (filter.contains('await')) filter = '(async () => { ' + filter + ' })()';
		let func = new Function('items', filter);
		let filteredItemsDataArray: DataArray<Record<string, Literal>> = await Promise.resolve(func(items));
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

			let {
				randomItems,
				totalValue,
			} = this.selectRandomItemsWithMaxTotalValue(filteredItemsArray, this.data.generatorSettings.maxTotalValue, this.data.generatorSettings.maxItems);

			//await dv.table(["File"], result.map(x => [x.file.link]), this.containerEl, this, this.file);
			await this.createTable(randomItems);
			this.tableContainer.createEl('span', {text: `Total Value: ${totalValue}`});
		} else {
			filteredItemsArray = filteredItemsArray.filter(x => {
				if (!x[this.data.itemIdField]) {
					return false;
				}

				return true;
			});

			let {randomItems, totalValue} = this.selectRandomItems(filteredItemsArray, this.data.generatorSettings.maxItems);

			//await dv.table(["File"], result.map(x => [x.file.link]), this.containerEl, this, this.file);
			await this.createTable(randomItems);
			this.tableContainer.createEl('span', {text: `Total Value: ${totalValue}`});
		}
	}

	async createTable(data: any[] | DataArray<any>) {
		this.tableContainer.empty();
		await createTable(this.data.tableBuilderData, data, this.tableContainer, this, this.file);
	}

	selectRandomItems(data: DvArray, maxItems: number): { randomItems: DvArray, totalValue: number } {
		let totalValue = 0;
		let randomItems: DvArray = [];

		while (randomItems.length < maxItems) {
			let item: Record<string, Literal> = this.getRandomItem(data);

			randomItems.push(item);
			totalValue += item[this.data.generatorSettings.itemValueField];
		}

		console.log(randomItems);
		return {randomItems, totalValue};
	}

	selectRandomItemsWithMaxTotalValue(dataArray: DvArray, maxValue: number, maxItems: number): { randomItems: DvArray, totalValue: number } {
		const valueWeight = this.data.generatorSettings.itemValueDistribution;
		const leniency = 0.5;

		let totalValue = 0;
		let randomItems: DvArray = [];

		while (randomItems.length < maxItems) {
			let remainingValue = maxValue - totalValue;
			// on the last item use the full remaining value as the target value
			let targetValue = randomItems.length < maxItems - 1 ? remainingValue * valueWeight : remainingValue;

			let items = this.filterByValue(dataArray, targetValue, leniency);
			if (items.length === 0) {
				console.warn('No item found with target value', targetValue);
				break;
			}

			let item: Record<string, Literal> = this.getWeightedRandomItem(items, targetValue);

			randomItems.push(item);
			totalValue += item[this.data.generatorSettings.itemValueField];
		}

		console.log(randomItems);
		return {randomItems, totalValue};
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
		const entries: { id: string, value: number, weight: number, comWeightStart: number }[] = [];
		let comWeight = 0;

		for (const d of data) {
			let id: string = d[this.data.itemIdField];
			let value: number = d[this.data.generatorSettings.itemValueField];
			let weight: number = this.bellCurveFast((value - centerValue) / centerValue);
			let comWeightStart = comWeight;
			comWeight += weight;

			entries.push({
				id,
				value,
				weight,
				comWeightStart,
			});
		}

		// console.log(entries);

		let randomValue = Math.random() * comWeight;

		for (let i = 0; i < entries.length; i++) {
			if (entries[i].comWeightStart > randomValue) {
				let retData = data.find(x => x[this.data.itemIdField] === entries[i].id);
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
