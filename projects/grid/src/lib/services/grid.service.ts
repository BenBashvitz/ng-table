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
  PrGroupByRow,
  PrRowGroup,
  ColumnResize
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

  getAllRows(grid: PrGrid, groupByColumnIds: string[]): PrDisplayableRow[] {
    if (!groupByColumnIds?.length) {
      return grid.rows;
    }

    const grouped = this.recursiveGroupBy(grid.rows, groupByColumnIds, 0, grid);
    return this.flattenGroupedData(grouped, 0);
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

      if (this.isRowArray(children)) {
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
      if (!this.isRowGroup(item)) {
        result.push(item);
        continue;
      }

      result.push({
        groupName: item.groupName,
        id: `group_by_${item.groupColumnId}_${item.groupName}`,
        discriminator: 'groupByRow',
        leafCount: item.leafCount,
        subtreeSize: item.subtreeSize,
        isOpen: true,
      });

      const children = item.children;

      if (Array.isArray(children)) {
        if (this.isRowArray(children)) {
          result.push(...children);
        } else {
          this.flattenGroupedData(children, level + 1, result);
        }
      }
    }

    return result;
  }

  updateDisplayedRows(rows: PrDisplayableRow[]): PrDisplayableRow[] {
    const result: PrDisplayableRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      result.push(row);

      if (this.isGroupByRow(row) && !row.isOpen) {
        i += row.subtreeSize;
      }
    }

    return result;
  }

  private isRowGroup(row: PrRowGroup | PrRow): row is PrRowGroup {
    return (row as PrRowGroup).groupName !== undefined;
  }

  private isRowArray(rows: PrRowGroup[] | PrRow[]): rows is PrRow[] {
    return rows[0]['discriminator'] === 'row';
  }

  private isGroupByRow(row: PrDisplayableRow): row is PrGroupByRow {
    return row.discriminator === 'groupByRow';
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
}
