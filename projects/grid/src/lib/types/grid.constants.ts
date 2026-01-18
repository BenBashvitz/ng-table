import {PrColumnWithMetadata, PrGridMetadata} from "./grid.interface";

export const columnDefaults: Omit<Required<PrColumnWithMetadata>, 'columnDef' | 'title'> = {
  widthInPx: 100,
  minWidthInPx: 70,
  maxWidthInPx: 400,
  isSticky: false,
  isRequired: false,
}
export const gridDefaults: Omit<PrGridMetadata, 'columns' | 'columnGroups'> = {
  pinnedRowsIds: [],
  groupByColumnIds: [],
  sortByColumn: undefined,
  rowHeightInPx: 30,
  maxWidthInPx: 1000
}
export const defaults: Omit<PrColumnWithMetadata & PrGridMetadata, 'columnDef' | 'title' | 'columns' | 'columnGroups'> = {
  ...columnDefaults,
  ...gridDefaults,
}

export const actionsColumnDef = 'ActionColumn';

export const actionsColumn: PrColumnWithMetadata = {
  columnDef: actionsColumnDef,
  title: '',
  widthInPx: 16
}
