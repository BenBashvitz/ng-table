import {Injectable} from "@angular/core";
import {defaults, PrColumn, PrColumnGroup, PrRow, PrTable} from "../types/table.interface";
import {ComponentStore} from "@ngrx/component-store";
import {TableService} from "../services/table.service";
import {tap} from "rxjs/operators";

export interface TableState {
  table: PrTable,
  scrollTop: number;
}

const initialState: TableState = {
  table: {
    columnGroups: [],
    rows: [],
    columnToCellMapper: {},
    selectedRowsIds: [],
    pinnedRowsIds: [],
    selectedCells: [],
    groupByColumnIds: [],
    sortByColumn: [],
    columnOrder: [],
    rowHeightInPx: defaults.rowHeightInPx,
  },
  scrollTop: 0
}

interface MoveItem<T = PrRow | PrColumn | PrColumnGroup> {
  item: T,
  currentIndex: number,
  previousIndex: number,
}

@Injectable()
export class TableStore extends ComponentStore<TableState> {
  constructor(private tableService: TableService) {
    super(initialState);
  }

  readonly table$ = this.select(state => state.table);
  readonly columnGroups$ = this.select(this.table$, table => table.columnGroups);
  readonly rows$ = this.select(this.table$, table => table.rows);
  readonly scrollTop$ = this.select(state => state.scrollTop);
  readonly rowHeightInPx$ = this.select(this.table$, table => table.rowHeightInPx ?? defaults.rowHeightInPx);

  readonly setTable = this.updater((state, table: PrTable) => ({
    ...state,
    table: this.tableService.divideColumnGroups(table)
  }));
  readonly setScrollTop = this.updater((state, scrollTop: number) => ({
    ...state,
    scrollTop,
  }))
  readonly moveColumnGroup = this.updater((state, moveGroup: MoveItem<PrColumnGroup>) => ({
    ...state,
    table: {
      ...this.tableService.changeColumnGroupOrder(state.table, moveGroup.item, moveGroup.previousIndex, moveGroup.currentIndex)
    },
  }))
  readonly moveColumn = this.updater((state, moveColumn: MoveItem<PrColumn>) => ({...state,
    table: {
      ...this.tableService.changeColumnOrder(state.table, moveColumn.item, moveColumn.previousIndex, moveColumn.currentIndex)
    },}))
  readonly moveRow = this.updater((state, moveRow: MoveItem<PrRow>) => ({
    ...state,
    table: {
      ...this.tableService.changeRowOrder(state.table, moveRow.item, moveRow.previousIndex, moveRow.currentIndex)
    },
  }))
}
