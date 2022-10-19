import {DataArray, getAPI, Literal} from 'obsidian-dataview';
import {Component} from 'obsidian';
import {file} from '@babel/types';
import {renderString} from '../utils/Utils';

export interface TableBuilderData {
	columns: {
		id: string,
		name: string,
		data: string,
	}[],
}
 export async function createTable(tableBuilderData: TableBuilderData, items: any[]|DataArray<any>, containerEl: HTMLElement, component: Component, filePath: string) {
	 const dv = getAPI();
	 if (!dv) {
		 return;
	 }

	 await dv.table(
		 tableBuilderData.columns.map(x => x.name),
		 items.map(x => tableBuilderData.columns.map(c => renderString(c.data, {item: x}))),
		 containerEl,
		 component,
		 filePath
	 );
 }
