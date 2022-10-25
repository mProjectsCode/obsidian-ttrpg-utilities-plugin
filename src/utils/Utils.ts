import {TableBuilderData} from '../tableBuilder/TableBuilder';

export function isTruthy(value: any): boolean {
	return !!value;
}

export function isFalsy(value: any): boolean {
	return !value;
}

export function equalOrIncludes(str1: string, str2: string): boolean {
	return str1 === str2 || str1.includes(str2) || str2.includes(str1);
}

export class TTRPGUtilitiesInternalError extends Error {
	constructor(message: string) {
		super(`[TTU_INTERNAL_ERROR - please report this error] ${message}`);
	}
}

export class TTRPGUtilitiesParsingError extends Error {
	constructor(message: string) {
		super(`[TTU_PARSING_ERROR] ${message}`);
	}
}

export interface InventoryGeneratorData {
	id: string,
	mode: InventoryGeneratorMode,
	generatorSettings: InventoryGeneratorSettings,
	itemIdField: string,
	tableBuilderData: TableBuilderData,
	generatedInventory: string[],
}

export enum InventoryGeneratorMode {
	GENERATOR,
	DISPLAY,
}

export interface InventoryGeneratorSettings {
	id: string,
	query: string,
	filter: string,
	maxItems: number,
	useMaxTotalValue: boolean,
	itemValueField: string,
	itemValueDistribution: number,
	maxTotalValue: number,
}

export function getDefaultInventoryGeneratorData(): InventoryGeneratorData {
	return {
		id: 'INVALID',
		itemIdField: 'id',
		mode: InventoryGeneratorMode.GENERATOR,
		tableBuilderData: {
			columns: [
				{
					id: getUUID(),
					name: 'File',
					data: '${item.file.link}',
				},
				{
					id: getUUID(),
					name: 'Cost',
					data: '${item.cost}',
				},
			],
		},
		generatedInventory: [],
		generatorSettings: {
			id: getUUID(),
			query: '"TTRPG Utils/items"',
			filter: 'return items;',
			maxItems: 10,
			useMaxTotalValue: true,
			itemValueField: 'cost',
			itemValueDistribution: 0.3,
			maxTotalValue: 10000,
		},
	};
}

export let lut: string[] = [];

export function initUUIDGen() {
	for (let i = 0; i < 256; i++) {
		lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
	}
}

export function getUUID() {
	let d0 = Math.random() * 0xffffffff | 0;
	let d1 = Math.random() * 0xffffffff | 0;
	let d2 = Math.random() * 0xffffffff | 0;
	let d3 = Math.random() * 0xffffffff | 0;
	return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
		lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
		lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
		lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
}


function traverseObject(path: string, o: any): any {
	// remove leading ${
	path = path.substring(2);
	// remove trailing }
	path = path.substring(0, path.length - 1);

	let pathParts = path
		.split('.')
		.map(x => x.split('[')
			.map(y => y.endsWith(']') ? y.substring(0, y.length - 1) : y));

	console.log(pathParts);

	for (const partPart1 of pathParts) {
		for (const pathPart2 of partPart1) {
			if (o !== undefined) {
				o = o[pathPart2];
			}
		}
	}

	return o;
}

export function renderString(str: string, obj: any) {
	return str.replace(/\$\{.+?\}/g, (match) => {
		return traverseObject(match, obj)?.toString();
	});
}
