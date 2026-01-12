import {Injectable} from "@angular/core";
import {
  columnDefaults,
  PrColumn,
  PrColumnGroup,
  PrRow,
  PrGrid,
  gridDefaults,
  PrGridMetadata,
  isFreeTextCell,
  isOptionsCell,
  isComponentCell,
  PrDisplayableRow,
  PrGroupByRow, PrRowGroup
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

  getGridPreferences(grid: PrGrid) {
    const gridMetadata: PrGridMetadata = {
      columnGroups: [],
      pinnedRowsIds: grid.pinnedRowsIds,
      groupByColumnIds: grid.groupByColumnIds,
      sortByColumn: grid.sortByColumn,
      rowHeightInPx: grid.rowHeightInPx,
    }
    return
  }

  getCurrentRows(grid: PrGrid, groupByColumnIds: string[]): PrDisplayableRow[] {
    if (!groupByColumnIds || groupByColumnIds.length === 0) {
      return grid.rows;
    }

    const groupedRows = this.recursiveGroupBy(grid.rows, groupByColumnIds, grid);
    return this.flattenGroupedData(groupedRows, groupByColumnIds);
  }

  private recursiveGroupBy(rows: PrRow[], groupByColumnIds: string[], grid: PrGrid): PrRowGroup[] | PrRow[] {
    if (groupByColumnIds.length === 0) {
      return rows;
    }

    const currentColumnId = groupByColumnIds[0];
    const remainingColumnIds = groupByColumnIds.slice(1);
    const groups: Record<string, PrRow[]> = {};

    rows.forEach(row => {
      const cell = grid.columnToCellMapper[currentColumnId](row);
      let key = '';

      if (isFreeTextCell(cell) || isOptionsCell(cell)) {
        key = cell.cellText;
      } else if (isComponentCell(cell)) {
        key = String(cell.value());
      }

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(row);
    });

    const result: PrRowGroup[] = [];

    for (const key in groups) {
      result.push({
        groupName: key,
        groupColumnId: currentColumnId,
        children: this.recursiveGroupBy(groups[key], remainingColumnIds, grid),
      });
    }

    return result;
  }

  private flattenGroupedData(groupedData: PrRowGroup[] | PrRow[], groupByColumnsIds: string[]): PrDisplayableRow[] {
    let result: PrDisplayableRow[] = [];

    groupedData.forEach((group: PrRowGroup | PrRow)  => {
        if (this.isRowGroup(group)) {
        result.push({
          groupName: group.groupName,
          id: `group_by_${group.groupColumnId}_${group.groupName}`,
          discriminator: 'groupByRow',
          count: group.children.length > 0 && !this.isRowGroup(group.children[0]) ? group.children.length : null,
          isOpen: true,
          level: groupByColumnsIds.indexOf(group.groupColumnId)
        });

        if (Array.isArray(group.children)) {
           if (group.children.length > 0 && this.isRowArray(group.children)) {
             result = result.concat(group.children);
           } else {
             result = result.concat(this.flattenGroupedData(group.children, groupByColumnsIds));
           }
        }
      }
    });

    return result;
  }

  private isRowGroup(row: PrRowGroup | PrRow): row is (PrRowGroup) {
    return row['groupName'] !== undefined;
  }

  private isRowArray(rows: PrRowGroup[] | PrRow[]): rows is (PrRow[]) {
    return rows[0]['discriminator'] === 'row';
  }

  updateDisplayedRows(currentRows: PrDisplayableRow[]): PrDisplayableRow[] {
    const newDisplayedRows: PrDisplayableRow[] = [];
    let isSkipping = false;
    let skippingLevel = -1;

    for (const row of currentRows) {
      const isGroup = this.isGroupByRow(row);

      // If we are in "skipping" mode, check if the current row is a child
      // or grandchild of the collapsed group.
      if (isSkipping && isGroup && row.level > skippingLevel) {
        continue; // Skip this row.
      }

      // If the current row is at the same level or higher, we can stop skipping.
      if (isSkipping && isGroup && row.level <= skippingLevel) {
        isSkipping = false;
      }

      // If we are skipping and this is a data row, it must be a child, so skip it.
      if (isSkipping && !isGroup) {
        continue;
      }

      // If we've reached this point, the row should be visible.
      newDisplayedRows.push(row);

      // If this row is a group that is now closed, start skipping subsequent rows.
      if (isGroup && !row.isOpen) {
        isSkipping = true;
        skippingLevel = row.level;
      }
    }

    return newDisplayedRows;
  }


  private isGroupByRow(row: PrDisplayableRow): row is (PrGroupByRow) {
    return row.discriminator === "groupByRow";
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
