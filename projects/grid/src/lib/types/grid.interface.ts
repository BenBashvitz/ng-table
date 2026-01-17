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

export type PrColumnWithMetadata<AvailableColumns extends string = string> =
  PrColumn<AvailableColumns>
  & PrColumnMetadata;

export type PrColumnGroup<AvailableColumns extends string = string> =
  Omit<PrColumnWithMetadata, 'widthInPx' | 'maxWidthInPx' | 'minWidthInPx'>
  & {
  columns: PrColumnWithMetadata<AvailableColumns>[];
}

export interface PrTextCell {
  cellText: string;
  onEdit?: (text: string) => void;
  discriminator: string;
}

export interface PrFreeTextCell extends PrTextCell {
  discriminator: 'Text'
}

export interface PrOptionsCell<Options extends string = string> extends PrTextCell {
  discriminator: 'Options',
  options: Options[];
}

export type PrComponentCell<ComponentInputs extends Record<string, unknown> = Record<string, unknown>> = {
  discriminator: 'Component';
  inputs: ComponentInputs
  component: ComponentType<unknown>;
  value: () => any;
}

export type PrCellType = PrTextCell | PrFreeTextCell | PrOptionsCell | PrComponentCell;

export type SelectedCellData = {
  columnDef: string;
  rowId: string | number;
}

export interface MoveItem<T = PrRow | PrColumn | PrColumnGroup> {
  item: T,
  currentIndex: number,
  previousIndex: number,
}

export interface ColumnResize {
  columnDef: string;
  newWidthInPx: number;
}

export type PrRowGroup = {
  groupName: string;
  groupColumnId: string;
  children: PrRow[] | PrRowGroup[];
  leafCount: number;
  subtreeSize: number;
}

export type PrGroupByRow = {
  discriminator: 'groupByRow';
  id: string;
  groupName: string;
  columnDef: string;
  isOpen: boolean;
  leafCount: number;
  subtreeSize: number;
}

export type PrRow = {
  discriminator: 'row';
  id: string | number;
}

export type PrSortDirection = 'asc' | 'desc';

export type PrDisplayableRow = PrGroupByRow | PrRow;

export type PrGridMetadata<AvailableColumns extends string = string> = {
  columnGroups: PrColumnGroup<AvailableColumns>[]
  pinnedRowsIds?: (string | number)[];
  groupByColumnIds?: AvailableColumns[]
  sortByColumnIds?: AvailableColumns[]
  rowHeightInPx?: number;
  maxWidthInPx?: number;
}

export type PrGrid<AvailableColumns extends string = string> = PrGridMetadata<AvailableColumns> & {
  rows: PrRow[];
  columnToCellMapper: Record<AvailableColumns, (row: PrRow) => PrCellType>;
}

export function isComponentCell(cell: PrCellType): cell is PrComponentCell<{}> {
  return cell.discriminator === "Component";
}

export function isTextCell(cell: PrCellType): cell is PrTextCell {
  return 'cellText' in cell;
}

export function isFreeTextCell(cell: PrCellType): cell is PrFreeTextCell {
  return cell.discriminator === "Text";
}

export function isOptionsCell(cell: PrCellType): cell is PrFreeTextCell {
  return cell.discriminator === "Options";
}

export function isColumnGroup(column: object): column is PrColumnGroup {
  return isColumn(column) && 'columns' in column;
}

export function isColumn(column: object): column is PrColumn {
  return 'columnDef' in column && 'title' in column;
}

export function isRowGroup(row: PrRowGroup | PrRow): row is PrRowGroup {
  return (row as PrRowGroup).groupName !== undefined;
}

export function isRowArray(rows: PrRowGroup[] | PrRow[]): rows is PrRow[] {
  return rows[0]['discriminator'] === 'row';
}

export function isGroupByRow(row: PrDisplayableRow): row is PrGroupByRow {
  return row.discriminator === 'groupByRow';
}

export const columnDefaults: Omit<Required<PrColumnWithMetadata>, 'columnDef' | 'title'> = {
  widthInPx: 100,
  minWidthInPx: 70,
  maxWidthInPx: 400,
  isSticky: false,
}

export const gridDefaults: Omit<PrGridMetadata, 'columns' | 'columnGroups'> = {
  pinnedRowsIds: [],
  groupByColumnIds: [],
  sortByColumnIds: [],
  rowHeightInPx: 30,
  maxWidthInPx: 1000
}

export const defaults: Omit<PrColumnWithMetadata & PrGridMetadata, 'columnDef' | 'title' | 'columns' | 'columnGroups'> = {
  ...columnDefaults,
  ...gridDefaults,
}
