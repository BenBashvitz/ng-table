import {Injectable} from "@angular/core";
import {defaults, PrColumn, PrColumnGroup, PrColumnWithMetadata, PrRow, PrTable} from "../types/table.interface";
import {ComponentStore} from "@ngrx/component-store";
import {TableService} from "../services/table.service";
import {ListRange} from "@angular/cdk/collections";
import {Observable} from "rxjs";

export interface TableState {
  table: PrTable,
  scrollTop: number;
  scrollRange: ListRange
}

const initialState: TableState = {
  table: {
    columnGroups: [],
    rows: [],
    columnToCellMapper: {},
    selectedRowIds: [],
    pinnedRowsIds: [],
    selectedCells: [],
    groupByColumnIds: [],
    sortByColumn: [],
    columnOrder: [],
    rowHeightInPx: defaults.rowHeightInPx,
  },
  scrollTop: 0,
  scrollRange: {
    start: 0,
    end: 0,
  }
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
  readonly columns$ = this.select(this.table$, table => table.columnGroups.reduce((tableColumns,{columns}) => {
    return [...tableColumns, ...columns]
  }, [] as PrColumnWithMetadata[]));
  readonly scrollTop$ = this.select(state => state.scrollTop);
  readonly gridTemplate$ = this.select(this.columns$, columns => {
    return columns.map(col => {
      return `${col.widthInPx ?? defaults.widthInPx}px`
    }).join(' ');
  });
  readonly tableWidth$ = this.select(this.columns$, columns => {
    return columns.reduce((width, {widthInPx}) => {
      return width + widthInPx + 2;
    }, -2)
  })
  readonly rowIndex$ = (rowId: string | number): Observable<number> => this.select(this.rows$, (rows) => rows.findIndex(row => row.id === rowId));

  readonly setTable = this.updater((state, table: PrTable) => ({
    ...state,
    table: this.tableService.initializeTable(table)
  }));
  readonly setScrollTop = this.updater((state, scrollTop: number) => ({
    ...state,
    scrollTop,
  }))
  readonly setScrollRange = this.updater((state, scrollRange: ListRange) => ({
    ...state,
    scrollRange,
  }))
  readonly moveColumnGroup = this.updater((state, moveGroup: MoveItem<PrColumnGroup>) => ({
    ...state,
    table: {
      ...this.tableService.changeColumnGroupOrder(state.table, moveGroup.item, moveGroup.previousIndex, moveGroup.currentIndex)
    },
  }))
  readonly moveColumn = this.updater((state, moveColumn: MoveItem<PrColumn>) => {
    const newTable = this.tableService.changeColumnOrder(state.table, moveColumn.item, moveColumn.previousIndex, moveColumn.currentIndex)

    return {...state,
      table: {
        ...newTable,
        rows: [...newTable.rows],
      },}
  })
  readonly moveRow = this.updater((state, moveRow: MoveItem<PrRow>) => ({
    ...state,
    table: {
      ...this.tableService.changeRowOrder(state.table, moveRow.item, moveRow.previousIndex, moveRow.currentIndex)
    },
  }))
  readonly selectRow = this.updater((state, rowId: string | number) => ({
    ...state,
    table: {
      ...state.table,
      selectedRowIds: [rowId]
    }
  }))
}
