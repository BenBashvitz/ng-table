import {ComponentType} from "@angular/cdk/portal";

export type PrColumn<AvailableColumns extends string = string> = {
  columnDef: AvailableColumns;
  title: string;
  maxWidthInPx?: number;
  minWidthInPx?: number;
  isSticky?: boolean;
}

export type PrCell = PrTextCell | PrCustomCell;

export type PrTextCell = {
  discriminator: 'Text'
  cellText: string;
  onEdit?: <T>(text: string) => T;
}

export type PrCustomCell<ComponentInputs extends Record<string, unknown> = Record<string, unknown>> =  {
  discriminator: 'Component';
  inputs: ComponentInputs
  component: ComponentType<unknown>;
  value: () => string;
}

export type PrRow = { id: string | number; }

export type PrTableMetadata<AvailableColumns extends string = string> = {
  columns: PrColumn<AvailableColumns>[];
  selectedRowsIds?: string[];
  pinnedRowsIds?: string[];
  selectedCells?: {
    rowId: string;
    columnDef: string;
  }[]
  groupByColumnIds?: AvailableColumns[]
  sortByColumn?: AvailableColumns[];
  columnOrder?: AvailableColumns[];
}

export type PrTable<AvailableColumns extends string = string> = PrTableMetadata<AvailableColumns> & {
  rows: PrRow[];
  columnToCellMapper: Record<AvailableColumns, (row: PrRow) => PrCell>;
}

export function isCustomCell(cell: PrCell): cell is PrCustomCell<{}> {
  return 'component' in cell;
}

export function isNormalCell(cell: PrCell): cell is PrCell {
  return !('component' in cell);
}

export interface PrTableVirtualScrollConfig {
  rowHeight: number;
  headerHeight: number;
  footerHeight: number;
  bufferMultiplier: number;
  headerEnabled?: boolean;
  footerEnabled?: boolean;
}

export const columnDefaults: Omit<PrColumn, 'columnDef' | 'title'> = {
  minWidthInPx: 70,
  maxWidthInPx: 400,
  isSticky: false,
}

export const virtualScrollDefaults: PrTableVirtualScrollConfig = {
  rowHeight: 52,
  headerHeight: 56,
  footerHeight: 52,
  bufferMultiplier: 0.7,
  headerEnabled: true,
  footerEnabled: false,
}

export const tableDefaults: Omit<PrTableMetadata, 'columns'> = {
  selectedCells: [],
  selectedRowsIds: [],
  pinnedRowsIds: [],
  groupByColumnIds: [],
  sortByColumn: undefined,
  columnOrder: undefined,
}

export const defaults: Omit<PrColumn & PrTableVirtualScrollConfig & PrTableMetadata, 'columnDef' | 'title' | 'columns'> = {
  ...columnDefaults,
  ...virtualScrollDefaults,
  ...tableDefaults,
}
