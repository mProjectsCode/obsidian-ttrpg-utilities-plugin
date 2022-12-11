import { TableBuilderData } from '../tableBuilder/TableBuilder';
import { traverseObject } from '@opd-libs/opd-utils-lib/lib/ObjectTraversalUtils';
import { isMdLink } from './MarkdownLinkParser';

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
	id: string;
	mode: InventoryGeneratorMode;
	generatorSettings: InventoryGeneratorSettings;
	itemIdField: string;
	tableBuilderData: TableBuilderData;
	generatedInventory: string[];
}

export enum InventoryGeneratorMode {
	GENERATOR,
	DISPLAY,
}

export interface InventoryGeneratorSettings {
	id: string;
	query: string;
	filter: string;
	maxItems: number;
	useMaxTotalValue: boolean;
	itemValueField: string;
	itemValueDistribution: number;
	maxTotalValue: number;
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

export function getUUID(): string {
	return crypto.randomUUID();
}

export function renderString(str: string, obj: any): string {
	console.log('-> obj', obj);
	console.log('-> str', str);
	console.log('---');

	return str.replace(/\$\{.+?\}/g, match => {
		// remove leading ${ and trailing }
		match = match.substring(2, match.length - 1);
		match = traverseObject(match, obj)?.toString();

		return match;
	});
}
