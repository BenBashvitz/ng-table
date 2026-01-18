import { Injectable } from '@angular/core';
import {
  ColumnResize,
  defaults,
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
} from '../types/grid.interface';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, withLatestFrom } from 'rxjs';
import { GridService } from "../services/grid.service";

export interface GridState {
  grid: PrGrid,
  selectedRows: (PrRow & { index: number })[],
  selectedCells: SelectedCellData[],
  allRows: PrDisplayableRow[],
  selectedColumns: PrColumnWithMetadata[],
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
  allRows: [],
  selectedColumns: [],
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
  readonly columnsWithSpace$ = this.select(this.grid$, table => table.columnGroups.reduce((tableColumns, {columns}, index) => {
    const emptyColumn: PrColumnWithMetadata = { columnDef: 'empty', title: '', widthInPx: 6};

    if(index === table.columnGroups.length - 1) {
      tableColumns = [...tableColumns, ...columns];
    } else {
      tableColumns = [...tableColumns, ...columns, emptyColumn];
    }

    return tableColumns
  }, [] as PrColumnWithMetadata[]))
  readonly gridTemplate$ = this.select(this.columnsWithSpace$, columns => {
    return columns.map(col => {
      return `${col.widthInPx ?? defaults.widthInPx}px`
    }).join(' ');
  });
  readonly gridWidth$ = this.select(this.columnsWithSpace$, columns => {
    return columns.reduce((width, {widthInPx}) => {
      return width + widthInPx;
    }, 0)
  })
  readonly maxWidth$ = this.select(this.grid$, grid => grid.maxWidthInPx ?? defaults.maxWidthInPx);
  readonly allRows$ = this.select(state => state.allRows);
  readonly selectedRows$ = this.select(state => state.selectedRows);
  readonly stickyColumnRight$ = (column: PrColumn) => this.select(this.columns$, columns => {
    const stickyColumns = columns.filter(({isSticky}) => isSticky);
    const columnIndex = stickyColumns.findIndex(({columnDef}) => column.columnDef === columnDef);

    return columnIndex === 0 ? '0px' : `${columns.slice(0, columnIndex).reduce((width, {widthInPx}) => width + widthInPx + 2, 0)}px`
  })
  readonly displayedRows$ = this.select(
    this.allRows$,
    allRows => this.gridService.getDisplayedRows(allRows)
  )
  readonly columnRight$ = (column: PrColumn) => this.select(this.columnsWithSpace$, columns => {
    const columnIndex = columns.findIndex(({columnDef}) => column.columnDef === columnDef);

    return columnIndex === 0 ? '2px' : `${columns.slice(0, columnIndex).reduce((width, {widthInPx}) => width + widthInPx, 1)}px`
  });
  readonly selectedCells$ = this.select(state => state.selectedCells);
  readonly selectedColumns$ = this.select(state => state.selectedColumns);
  readonly setGrid = this.updater((state, table: PrGrid) => ({
    ...state,
    grid: this.gridService.initializeGrid(table)
  }));
  readonly setGroupByColumnIds = this.updater((state, groupByColumnIds: string[]) => ({
    ...state,
    grid: {
      ...state.grid,
      groupByColumnIds
    }
  }));
  readonly setRows = this.updater((state, rows: PrRow[]) => ({
    ...state,
    grid: {
      ...state.grid,
      rows
    }
  }))
  readonly addGroupByColumnId = this.updater((state, columnDef: string) => ({
    ...state,
    grid: {
      ...state.grid,
      groupByColumnIds: [...state.grid.groupByColumnIds, columnDef]
    }
  }))
  readonly removeGroupByColumnId = this.updater((state, columnDef: string) => ({
    ...state,
    grid: {
      ...state.grid,
      groupByColumnIds: state.grid.groupByColumnIds.filter(column => column !== columnDef)
    }
  }))
  readonly moveColumnGroup = this.updater((state, moveGroup: MoveItem<PrColumnGroup>) => ({
    ...state,
    grid: {
      ...this.gridService.changeColumnGroupOrder(state.grid, moveGroup.item, moveGroup.previousIndex, moveGroup.currentIndex)
    },
  }));
  readonly moveColumn = this.updater((state, moveColumn: MoveItem<PrColumn>) => {
    const newTable = this.gridService.changeColumnOrder(state.grid, moveColumn.item, moveColumn.previousIndex, moveColumn.currentIndex)

    return {
      ...state,
      grid: {
        ...newTable,
        rows: [...newTable.rows],
      },
    }
  });
  readonly moveRow = this.updater((state, moveRow: MoveItem<PrRow>) => ({
    ...state,
    grid: {
      ...this.gridService.changeRowOrder(state.grid, moveRow.item, moveRow.previousIndex, moveRow.currentIndex)
    },
  }));
  readonly removeColumn = this.updater((state, column: PrColumnWithMetadata) => ({
    ...state,
    grid: this.gridService.removeColumn(state.grid, column),
  }));
  readonly removeColumnGroup = this.updater((state, columnGroup: PrColumnGroup) => ({
    ...state,
    grid: this.gridService.removeColumnGroup(state.grid, columnGroup),
  }));
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
  }));
  readonly setSelectedColumn = this.updater((state, column: PrColumn) => ({
    ...state,
    selectedColumns: [column],
    selectedRows: [],
    selectedCells: [],
  }))
  readonly updateAllRows = this.updater((state) => ({
  ...state,
  allRows: this.gridService.getAllRows(state.grid)
  }))
  readonly setColumnWidthInPx = this.updater((state, columnResize: ColumnResize) => ({
    ...state,
    grid: this.gridService.setColumnWidth(state.grid, columnResize),
  }))
  readonly collapseExpandAllGroups = this.updater((state, isExpand: boolean) => ({
    ...state,
    allRows: this.gridService.collapseExpandAllGroups(state.allRows, isExpand)
  }));
  readonly toggleGroupByRow = this.updater(
    (state, { rowId, isOpen }: { rowId: string; isOpen: boolean }) => ({
      ...state,
      allRows: state.allRows.map(row =>
        row.id === rowId
          ? { ...row, isOpen }
          : row
      )
    })
  );
  readonly copyColumn = this.effect<PrColumnWithMetadata>((triggers$: Observable<PrColumn>) => triggers$.pipe(
    withLatestFrom<PrColumn, [PrGrid]>(this.grid$),
    switchMap(([column, grid]) => {
      const text = [
        column.title,
        ...grid.rows.map(row => {
          const cell: PrCellType = grid.columnToCellMapper[column.columnDef](row);

          if (isComponentCell(cell)) {
            return cell.value();
          }

          if (isTextCell(cell)) {
            return cell.cellText;
          }

          return '';
        })
      ].join('\n');

      return navigator.clipboard.writeText(text);
    })
  ));
}
