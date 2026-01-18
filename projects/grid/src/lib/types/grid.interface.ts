import {ComponentType} from "@angular/cdk/portal";

export type PrColumnMetadata = {
  widthInPx?: number;
  maxWidthInPx?: number;
  minWidthInPx?: number;
  isSticky?: boolean;
  isRequired?: boolean;
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

export type PrGridAction = {
  label: string,
  onAction: <T>() => T | void,
}

export type PrGridActions = PrGridAction[]

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

export type PrActionsCell = {
  discriminator: 'Actions';
  actions: PrGridActions
}

export type PrCellType = PrTextCell | PrFreeTextCell | PrOptionsCell | PrComponentCell | PrActionsCell;

export type PrEditableCell = PrTextCell | PrFreeTextCell | PrOptionsCell;

export type SelectedCellData = {
  columnDef: string;
  rowId: string | number;
}

export type PrSelectedRowData = {
  row: PrRow,
  index: number
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
  id: string;
}

export type PrSortDirection = 'asc' | 'desc';

export type PrSortColumn<AvailableColumns extends string = string> = {
  id: AvailableColumns;
  direction: PrSortDirection;
};

export type PrDisplayableRow = PrGroupByRow | PrRow;

export type PrGridMetadata<AvailableColumns extends string = string> = {
  columnGroups: PrColumnGroup<AvailableColumns>[]
  pinnedRowsIds?: (string | number)[];
  groupByColumnIds?: AvailableColumns[];
  sortByColumns?: PrSortColumn[];
  rowHeightInPx?: number;
  maxWidthInPx?: number;
}

export type PrGrid<AvailableColumns extends string = string> = PrGridMetadata<AvailableColumns> & {
  rows: PrRow[];
  columnToCellMapper: Record<AvailableColumns, (row: PrRow) => PrCellType>;
  rowActions?: PrGridActions
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

export function isActionsCell(cell: PrCellType): cell is PrActionsCell {
  return cell.discriminator === "Actions";
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

export function isEditableCell(row: PrCellType): row is PrEditableCell {
  return row.discriminator === 'Text' || row.discriminator === 'Options';
}
