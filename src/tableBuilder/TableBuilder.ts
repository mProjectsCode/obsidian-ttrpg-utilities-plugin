import { DataArray, getAPI } from 'obsidian-dataview';
import { Component } from 'obsidian';
import { renderString } from '../utils/Utils';
import TableComponent from './../table/TableComponent.svelte';

export interface TableBuilderData {
	columns: {
		id: string;
		name: string;
		data: string;
	}[];
}

export function createTable(tableBuilderData: TableBuilderData, items: any[] | DataArray<any>, containerEl: HTMLElement): void {
	const dv = getAPI();
	if (!dv) {
		return;
	}

	new TableComponent({
		target: containerEl,
		props: {
			tableBuilderData: tableBuilderData,
			tableContent: items,
		},
	});
}
