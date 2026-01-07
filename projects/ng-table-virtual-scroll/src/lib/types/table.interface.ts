import {ComponentType} from "@angular/cdk/portal";

export type PrColumnMetadata = {
  widthInPx?: number;
  maxWidthInPx?: number;
  minWidthInPx?: number;
  isSticky?: boolean;
}

export type PrColumn<AvailableColumns extends string = string> = {
  columnDef: AvailableColumns;
  title: string;
}

export type PrColumnWithMetadata<AvailableColumns extends string = string> = PrColumn<AvailableColumns> & PrColumnMetadata;

export type PrColumnGroup<AvailableColumns extends string = string> = PrColumnWithMetadata & {
  columns: PrColumnWithMetadata<AvailableColumns>[];
}

export type PrCell = PrTextCell | PrCustomCell;

export type PrTextCell = {
  discriminator: 'Text'
  cellText: string;
  onEdit?: <T>(text: string) => void;
}

export type PrCustomCell<ComponentInputs extends Record<string, unknown> = Record<string, unknown>> =  {
  discriminator: 'Component';
  inputs: ComponentInputs
  component: ComponentType<unknown>;
  value: () => any;
}

export type PrRow = {
  id: string | number;
}

export type PrTableMetadata<AvailableColumns extends string = string> = {
  columnGroups: PrColumnGroup<AvailableColumns>[]
  selectedRowIds?: (string | number)[];
  pinnedRowsIds?: (string | number)[];
  selectedCells?: {
    rowId: string | number;
    columnDef: string;
  }[]
  groupByColumnIds?: AvailableColumns[]
  sortByColumn?: AvailableColumns[];
  columnOrder?: AvailableColumns[];
  rowHeightInPx?: number;
}

export type PrTable<AvailableColumns extends string = string> = PrTableMetadata<AvailableColumns> & {
  rows: PrRow[];
  columnToCellMapper: Record<AvailableColumns, (row: PrRow) => PrCell>;
}

export function isCustomCell(cell: PrCell): cell is PrCustomCell<{}> {
  return 'component' in cell;
}

export function isNormalCell(cell: PrCell): cell is PrTextCell {
  return !('component' in cell);
}

export function isColumnGroup(column: object): column is PrColumnGroup {
  return isColumn(column) && 'columns' in column;
}

export function isColumn(column: object): column is PrColumn {
  return 'columnDef' in column && 'title' in column;
}

export interface PrTableVirtualScrollConfig {
  rowHeight: number;
  headerHeight: number;
  footerHeight: number;
  bufferMultiplier: number;
  headerEnabled?: boolean;
  footerEnabled?: boolean;
}

export const columnDefaults: Omit<Required<PrColumnWithMetadata>, 'columnDef' | 'title'> = {
  widthInPx: 100,
  minWidthInPx: 70,
  maxWidthInPx: 400,
  isSticky: false,
}

export const virtualScrollDefaults: PrTableVirtualScrollConfig = {
  rowHeight: 36,
  headerHeight: 54,
  footerHeight: 52,
  bufferMultiplier: 0.7,
  headerEnabled: true,
  footerEnabled: false,
}

export const tableDefaults: Omit<PrTableMetadata, 'columns' | 'columnGroups'> = {
  selectedCells: [],
  selectedRowIds: [],
  pinnedRowsIds: [],
  groupByColumnIds: [],
  sortByColumn: undefined,
  columnOrder: undefined,
  rowHeightInPx: 36,
}

export const defaults: Omit<PrColumnWithMetadata & PrTableVirtualScrollConfig & PrTableMetadata, 'columnDef' | 'title' | 'columns' | 'columnGroups'> = {
  ...columnDefaults,
  ...virtualScrollDefaults,
  ...tableDefaults,
}
