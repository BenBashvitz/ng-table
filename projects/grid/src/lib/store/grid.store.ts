import {Injectable} from "@angular/core";
import {
  ColumnResize,
  defaults,
  GridService,
  isComponentCell,
  isTextCell,
  MoveItem,
  PrCellType,
  PrColumn,
  PrColumnGroup,
  PrColumnWithMetadata,
  PrDisplayableRow,
  PrGrid,
  PrRow,
  SelectedCellData
} from "@parlament/grid";
import {ComponentStore} from "@ngrx/component-store";
import {switchMap, withLatestFrom, map} from "rxjs";

export interface GridState {
  grid: PrGrid,
  selectedRows: (PrRow & { index: number })[],
  selectedCells: SelectedCellData[],
  selectedColumns: PrColumnWithMetadata[],
  displayedRows: PrDisplayableRow[]
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
    maxWidthInPx: defaults.maxWidthInPx
  },
  selectedCells: [],
  selectedRows: [],
  selectedColumns: [],
  displayedRows: []
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
    }, 13)
  })
  readonly maxWidth$ = this.select(this.grid$, grid => grid.maxWidthInPx ?? defaults.maxWidthInPx);
  readonly groupByColumnIds$ = this.select(this.grid$, grid => grid.groupByColumnIds);
  readonly rows$ = this.select(this.grid$, grid => grid.rows);
  readonly displayedRows$ = this.select(state => state.displayedRows);
  readonly selectedRows$ = this.select(state => state.selectedRows);
  readonly stickyColumnRight$ = (column: PrColumn) => this.select(this.columns$, columns => {
    const stickyColumns = columns.filter(({isSticky}) => isSticky);
    const columnIndex = stickyColumns.findIndex(({columnDef}) => column.columnDef === columnDef);

    return columnIndex === 0 ? '0px' : `${columns.slice(0, columnIndex).reduce((width, {widthInPx}) => width + widthInPx + 2, 0)}px`
  })
  readonly columnRight$ = (column: PrColumn) => this.select(this.columns$, columns => {
    const columnIndex = columns.findIndex(({columnDef}) => column.columnDef === columnDef);

    return columnIndex === 0 ? '0px' : `${columns.slice(0, columnIndex).reduce((width, {widthInPx}) => width + widthInPx + 2, 0)}px`
  })
  readonly selectedCells$ = this.select(state => state.selectedCells);
  readonly selectedColumns$ = this.select(state => state.selectedColumns);

  readonly currentRows$ = this.select(
    this.groupByColumnIds$,
    this.rows$,
    (groupByColumnIds, rows) => ({ groupByColumnIds, rows })
  ).pipe(
    withLatestFrom(this.grid$),
    map(([{ groupByColumnIds }, grid]) => {
      return this.gridService.getCurrentRows(grid, groupByColumnIds);
    })
  );
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
  }));
  readonly removeColumn = this.updater((state, column:PrColumnWithMetadata) => ({
    ...state,
    grid: this.gridService.removeColumn(state.grid, column),
  }))
  readonly removeColumnGroup = this.updater((state, columnGroup:PrColumnGroup) => ({
    ...state,
    grid: this.gridService.removeColumnGroup(state.grid, columnGroup),
  }))
  readonly setSelectedRow = this.updater((state, rowData: { row: PrRow, index: number }) => ({
    ...state,
    selectedRows: [{
      ...rowData.row,
      index: rowData.index,
    }],
    selectedCells: [],
    selectedColumns: [],
  }));
  readonly setSelectedCell = this.updater((state, cell: SelectedCellData) => ({
    ...state,
    selectedCells: [cell],
    selectedRows: [],
    selectedColumns: [],
  }))
  readonly setSelectedColumn = this.updater((state, column: PrColumn) => ({
    ...state,
    selectedColumns: [column],
    selectedRows: [],
    selectedCells: [],
  }))
  readonly setDisplayedRows = this.updater((state, currentRows: PrDisplayableRow[]) => ({
    ...state,
    displayedRows: this.gridService.updateDisplayedRows(currentRows)
  }))
  readonly setColumnWidthInPx = this.updater((state, columnResize: ColumnResize) => ({
    ...state,
    grid: this.gridService.setColumnWidth(state.grid, columnResize),
  }));
  readonly copyColumn = this.effect<PrColumnWithMetadata>(triggers$ => triggers$.pipe(
    withLatestFrom(this.grid$),
    switchMap(([column, grid]) => {
      const text = [
        column.title,
        ...grid.rows.map(row => {
          const cell: PrCellType = grid.columnToCellMapper[column.columnDef](row);

          if(isComponentCell(cell)) {
            return cell.value();
          }

          if(isTextCell(cell)) {
            return cell.cellText;
          }

          return '';
        })
      ].join('\n');

      return navigator.clipboard.writeText(text);
    })
  ));
}
