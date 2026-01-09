import {Injectable} from "@angular/core";
import {defaults, PrColumn, PrColumnGroup, PrColumnWithMetadata, PrRow, PrGrid, PrCell} from "../types/grid.interface";
import {ComponentStore} from "@ngrx/component-store";
import {GridService} from "../services/grid.service";
import {Observable} from "rxjs";

export interface GridState {
  grid: PrGrid,
  selectedRows: (PrRow & {index: number})[],
  selectedCells: PrCell[],
}

const initialState: GridState = {
  grid: {
    columnGroups: [],
    rows: [],
    columnToCellMapper: {},
    pinnedRowsIds: [],
    groupByColumnIds: [],
    sortByColumn: [],
    rowHeightInPx: defaults.rowHeightInPx,
  },
  selectedCells: [],
  selectedRows: [],
}

interface MoveItem<T = PrRow | PrColumn | PrColumnGroup> {
  item: T,
  currentIndex: number,
  previousIndex: number,
}

interface ColumnResize {
  columnDef: string;
  newWidthInPx: number;
}

@Injectable()
export class GridStore extends ComponentStore<GridState> {
  constructor(private gridService: GridService) {
    super(initialState);
  }

  readonly grid$ = this.select(state => state.grid);
  readonly columns$ = this.select(this.grid$, table => table.columnGroups.reduce((tableColumns, {columns}) => {
    return [...tableColumns, ...columns]
  }, [] as PrColumnWithMetadata[]));
  readonly gridTemplate$ = this.select(this.columns$, columns => {
    return columns.map(col => {
      return `${col.widthInPx ?? defaults.widthInPx}px`
    }).join(' ');
  });
  readonly gridWidth$ = this.select(this.columns$, columns => {
    return columns.reduce((width, {widthInPx}) => {
      return width + widthInPx + 2;
    }, -2)
  })
  readonly selectedRows$ = this.select(state => state.selectedRows);
  readonly columnRightInPx$ = (column: PrColumn) => this.select(this.columns$, columns => {
    const stickyColumns = columns.filter(({isSticky}) => isSticky);
    const columnIndex = stickyColumns.findIndex(({columnDef}) => column.columnDef === columnDef);
    return columnIndex === 0 ? '0px' : `${columns.slice(0,columnIndex).reduce((width, {widthInPx}) => width + widthInPx + 2, 0)}px`
  })

  readonly setGrid = this.updater((state, table: PrGrid) => ({
    ...state,
    grid: this.gridService.initializeGrid(table)
  }));
  readonly moveColumnGroup = this.updater((state, moveGroup: MoveItem<PrColumnGroup>) => ({
    ...state,
    grid: {
      ...this.gridService.changeColumnGroupOrder(state.grid, moveGroup.item, moveGroup.previousIndex, moveGroup.currentIndex)
    },
  }))
  readonly moveColumn = this.updater((state, moveColumn: MoveItem<PrColumn>) => {
    const newTable = this.gridService.changeColumnOrder(state.grid, moveColumn.item, moveColumn.previousIndex, moveColumn.currentIndex)

    return {
      ...state,
      grid: {
        ...newTable,
        rows: [...newTable.rows],
      },
    }
  })
  readonly moveRow = this.updater((state, moveRow: MoveItem<PrRow>) => ({
    ...state,
    grid: {
      ...this.gridService.changeRowOrder(state.grid, moveRow.item, moveRow.previousIndex, moveRow.currentIndex)
    },
  }))
  readonly setSelectedRow = this.updater((state, rowData:{row: PrRow, index: number}) => ({
    ...state,
    selectedRows: [{
      ...rowData.row,
      index: rowData.index,
    }]
  }))

  readonly setColumnWidthInPx = this.updater((state, columnResize: ColumnResize) => ({
    ...state,
    grid: {
      ...state.grid,
      columnGroups: state.grid.columnGroups.map(columnGroup => ({
        ...columnGroup,
        columns: columnGroup.columns.map(column => ({
          ...column,
          widthInPx: column.columnDef === columnResize.columnDef ? columnResize.newWidthInPx : column.widthInPx
        }))
      }))
    }
  }))
}
