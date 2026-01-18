import {Injectable} from "@angular/core";
import {
  columnDefaults,
  PrColumn,
  PrColumnGroup,
  PrRow,
  PrGrid,
  gridDefaults,
  isFreeTextCell,
  isOptionsCell,
  isComponentCell,
  PrDisplayableRow,
  PrRowGroup,
  ColumnResize,
  isGroupByRow,
  isRowArray,
  isRowGroup,
  PrTextCell,
  PrSortColumn
} from '../types/grid.interface';
import {moveItemInArray} from "@angular/cdk/drag-drop";

@Injectable({
  providedIn: 'root'
})
export class GridService {
  initializeGrid(table: PrGrid) {
    return this.divideColumnGroups(this.setGridColumnDefaultValues(this.setGridDefaultValues(table)));
  }

  changeColumnGroupOrder(table: PrGrid, columnGroup: PrColumnGroup, previousIndex: number, currentIndex: number) {
    const actualPreviousIndex = table.columnGroups.indexOf(columnGroup);
    const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
    moveItemInArray(table.columnGroups, actualPreviousIndex, actualCurrentIndex);

    return table;
  }

  changeColumnOrder(table: PrGrid, column: PrColumn, previousIndex: number, currentIndex: number) {
    const columnGroup = table.columnGroups.find(({columns}) => columns.includes(column));

    if (columnGroup) {
      const actualPreviousIndex = columnGroup.columns.indexOf(column);
      const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
      moveItemInArray(columnGroup.columns, actualPreviousIndex, actualCurrentIndex);
    }

    return table;
  }

  changeRowOrder(table: PrGrid, row: PrRow, previousIndex: number, currentIndex: number) {
    const actualPreviousIndex = table.rows.indexOf(row);
    const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
    moveItemInArray(table.rows, actualPreviousIndex, actualCurrentIndex);

    return table;
  }

  setColumnWidth(grid: PrGrid, {columnDef, newWidthInPx}: ColumnResize) {
    return {
      ...grid,
      columnGroups: grid.columnGroups.map((columnGroup) => ({
        ...columnGroup,
        columns: columnGroup.columns.map((column) => ({
          ...column,
          widthInPx: column.columnDef === columnDef ? newWidthInPx : column.widthInPx
        }))
      }))
    };
  }

  removeColumn(grid: PrGrid, column: PrColumn) {
    return {
      ...grid,
      columnGroups: grid.columnGroups.map((group) => ({
        ...group,
        columns: group.columns.filter(({columnDef}) => column.columnDef !== columnDef),
      }))
    }
  }

  removeColumnGroup(grid: PrGrid, columnGroup: PrColumn) {
    return {
      ...grid,
      columnGroups: grid.columnGroups.filter(({columnDef}) => columnGroup.columnDef !== columnDef)
    }
  }

  getAllRows(grid: PrGrid): PrDisplayableRow[] {
    const groupedRows: PrDisplayableRow[] = grid.groupByColumnIds?.length
      ? this.flattenGroupedData(this.recursiveGroupBy(grid.rows, grid.groupByColumnIds, 0, grid), 0)
      : grid.rows;

    return grid.sortByColumns?.length
      ? this.sortRows(groupedRows, grid.sortByColumns, grid.columnToCellMapper)
      : groupedRows;
  }

  private recursiveGroupBy(
    rows: PrRow[],
    groupByColumnIds: string[],
    level: number,
    grid: PrGrid
  ): PrRowGroup[] | PrRow[] {
    if (level >= groupByColumnIds.length) {
      return rows;
    }

    const columnId = groupByColumnIds[level];
    const groups = new Map<string, PrRow[]>();

    for (const row of rows) {
      const cell = grid.columnToCellMapper[columnId](row);
      const key = isFreeTextCell(cell) || isOptionsCell(cell) ? cell.cellText : isComponentCell(cell) ? String(cell.value()) : '';

      const rowBucket = groups.get(key);
      rowBucket ? rowBucket.push(row) : groups.set(key, [row]);
    }

    return Array.from(groups.entries(), ([groupName, groupRows]) => {
      const children = this.recursiveGroupBy(groupRows, groupByColumnIds,level + 1, grid);

      let leafCount = 0;
      let subtreeSize = 0;

      if (isRowArray(children)) {
        leafCount = children.length;
        subtreeSize = children.length;
      } else {
        for (const group of children) {
          leafCount += group.leafCount;
          subtreeSize += 1 + group.subtreeSize;
        }
      }

      return { groupName, groupColumnId: columnId, children, leafCount, subtreeSize };
    });
  }

  private flattenGroupedData(
    groupedData: PrRowGroup[] | PrRow[],
    level: number,
    result: PrDisplayableRow[] = []
  ): PrDisplayableRow[] {
    for (const item of groupedData) {
      if (!isRowGroup(item)) {
        result.push(item);
        continue;
      }

      result.push({
        groupName: item.groupName,
        id: `group_by_${item.groupColumnId}_${item.groupName}`,
        columnDef: item.groupColumnId,
        discriminator: 'groupByRow',
        leafCount: item.leafCount,
        subtreeSize: item.subtreeSize,
        isOpen: true,
      });

      const children = item.children;

      if (Array.isArray(children)) {
        if (isRowArray(children)) {
          result.push(...children);
        } else {
          this.flattenGroupedData(children, level + 1, result);
        }
      }
    }

    return result;
  }

  getDisplayedRows(rows: PrDisplayableRow[]): PrDisplayableRow[] {
    const result: PrDisplayableRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      result.push(row);

      if (isGroupByRow(row) && !row.isOpen) {
        i += row.subtreeSize;
      }
    }

    return result;
  }

  collapseExpandAllGroups(rows: PrDisplayableRow[], isExpand: boolean): PrDisplayableRow[] {
    if (!isGroupByRow(rows[0])) return rows;

    const result: PrDisplayableRow[] = [];

    for (const row of rows) {
      if (isGroupByRow(row)) {
        result.push({ ...row, isOpen: isExpand });
      } else {
        result.push(row);
      }
    }

    return result;
  }

  private setGridDefaultValues(table: PrGrid): PrGrid {
    return {
      ...gridDefaults,
      ...table
    }
  }

  private divideColumnGroups(table: PrGrid): PrGrid {
    let dividedColumnGroups: PrColumnGroup[] = []

    table.columnGroups.forEach(columnGroup => {
      let dividedGroup: PrColumnGroup[] = []

      columnGroup.columns
        .forEach((column, index) => {
          if (!column.isSticky) {
            if (dividedGroup.length === 0 || dividedGroup[dividedGroup.length - 1].isSticky) {
              dividedGroup = [...dividedGroup, {
                columnDef: columnGroup.columnDef + `__${index}`,
                title: columnGroup.title,
                columns: [column],
                isSticky: false
              }]
            } else {
              dividedGroup[dividedGroup.length - 1].columns.push(column);
              dividedGroup[dividedGroup.length - 1].columnDef = dividedGroup[dividedGroup.length - 1].columnDef + `__${index}`
            }
          } else {
            dividedGroup = [...dividedGroup, {
              columnDef: columnGroup.columnDef + `-${index}`,
              title: columnGroup.title,
              columns: [column],
              isSticky: true
            }]
          }
        })

      if (dividedGroup[dividedGroup.length - 1].columns.length === 0) dividedGroup.pop()

      dividedColumnGroups = [...dividedColumnGroups, ...dividedGroup]
    })

    table.columnGroups = dividedColumnGroups;

    return table
  }

  private setGridColumnDefaultValues(table: PrGrid): PrGrid {
    return {
      ...table,
      columnGroups: table.columnGroups.map((columnGroup) => ({
        ...columnGroup,
        columns: columnGroup.columns.map(column => ({
          ...columnDefaults,
          ...column
        }))
      }))
    }
  }

  sortRows(
    allRows: PrDisplayableRow[],
    sortByColumns: PrSortColumn[],
    columnToCellMapper: PrGrid['columnToCellMapper']
  ): PrDisplayableRow[] {
    if (allRows.length <= 1 || !sortByColumns?.length) return allRows;
    const comparator = this.buildMultiStringComparator(sortByColumns, columnToCellMapper);

    if (!isGroupByRow(allRows[0])) {
      const decoratedRows = (allRows as PrRow[]).map((row, index) => ({ row, index }));
      decoratedRows.sort((x, y) => {
        const result = comparator(x.row, y.row);

        return result !== 0 ? result : x.index - y.index;
      });

      return decoratedRows.map(x => x.row);
    }

    const out = allRows.slice();

    for (let i = 0; i < out.length; i++) {
      const row = out[i];

      if (!isGroupByRow(row)) continue;

      const subtreeStart = i + 1;

      const subtreeEndExclusive = Math.min(out.length, subtreeStart + row.subtreeSize);

      let firstNestedGroupIndex = -1;
      for (let j = subtreeStart; j < subtreeEndExclusive; j++) {
        if (isGroupByRow(out[j])) {
          firstNestedGroupIndex = j;
          break;
        }
      }

      if (firstNestedGroupIndex !== -1) {
        i = firstNestedGroupIndex - 1;
        continue;
      }

      this.stableSortLeafSegment(out, subtreeStart, subtreeEndExclusive, comparator);

      i = subtreeEndExclusive - 1;
    }

    return out;
  }

  private buildMultiStringComparator(
    sortByColumns: PrSortColumn[],
    columnToCellMapper: PrGrid['columnToCellMapper']
  ): (a: PrRow, b: PrRow) => number {

    const sortKeys = sortByColumns
      .map(({ id, direction }) => {
        const mappedField = columnToCellMapper[id];
        if (!mappedField) return undefined;

        return {
          get: (row: PrRow) => String((mappedField(row) as PrTextCell)?.cellText ?? '').trim(),
          dir: direction === 'desc' ? -1 : 1 as const,
        };
      })
      .filter((x): x is { get: (row: PrRow) => string; dir: 1 | -1 } => !!x);

    if (sortKeys.length === 0) return () => 0;

    return (rowA: PrRow, rowB: PrRow) => {
      for (let i = 0; i < sortKeys.length; i++) {
        const { get, dir } = sortKeys[i];

        const aValue = get(rowA);
        const bValue = get(rowB);

        if (aValue === bValue) continue;

        const aEmpty = aValue === '';
        const bEmpty = bValue === '';
        if (aEmpty || bEmpty) {
          if (aEmpty && bEmpty) continue;
          return aEmpty ? 1 : -1;
        }

        const result = aValue.localeCompare(bValue, undefined, {
          numeric: true,
          sensitivity: 'base',
        });

        if (result !== 0) return result * dir;
      }
      return 0;
    };
  }

  private stableSortLeafSegment(
    rows: PrDisplayableRow[],
    start: number,
    endExclusive: number,
    comparator: (a: PrRow, b: PrRow) => number
  ): void {
    const length = endExclusive - start;

    if (length <= 1) return;

    const decoratedRows = new Array<{ row: PrRow; index: number }>(length);
    for (let k = 0; k < length; k++) {
      decoratedRows[k] = { row: rows[start + k] as PrRow, index: k };
    }

    decoratedRows.sort((x, y) => {
      const v = comparator(x.row, y.row);

      return v !== 0 ? v : x.index - y.index;
    });

    for (let k = 0; k < length; k++) {
      rows[start + k] = decoratedRows[k].row;
    }
  }
}
