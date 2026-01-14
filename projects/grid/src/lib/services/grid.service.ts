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
  ColumnResize,
} from "../types/grid.interface";
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
      columnGroups: grid.columnGroups.map(columnGroup => ({
        ...columnGroup,
        columns: columnGroup.columns.map(column => ({
          ...column,
          widthInPx: column.columnDef === columnDef ? newWidthInPx : column.widthInPx
        }))
      }))
    }
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

  getGroupByArray(grid: PrGrid, groupByColumnIds: string[]): any[] {
    if (!groupByColumnIds || groupByColumnIds.length === 0) {
      return grid.rows;
    }

    const grouped = this.groupByRecursive(grid.rows, groupByColumnIds, grid);
    return this.flattenGroupedData(grouped);
  }

  private groupByRecursive(rows: PrRow[], groupByColumnIds: string[], grid: PrGrid): any {
    if (groupByColumnIds.length === 0) {
      return rows;
    }

    const currentColumnId = groupByColumnIds[0];
    const remainingColumnIds = groupByColumnIds.slice(1);

    const groups: Record<string, any> = {};

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

    const result: any[] = [];
    for (const key in groups) {
      result.push({
        groupName: key,
        groupColumnId: currentColumnId,
        children: this.groupByRecursive(groups[key], remainingColumnIds, grid)
      });
    }

    return result;
  }

  private flattenGroupedData(groupedData: any[]): any[] {
    let result: any[] = [];

    groupedData.forEach(group => {
      if (group.groupName) {
        result.push({
          groupName: group.groupName,
          id: group.groupColumnId,
          discriminator: 'groupByRow',
          count: group.children.length > 0 && !group.children[0].groupName ? group.children.length : null
        });
        if (Array.isArray(group.children)) {
           // Check if children are leaf rows or subgroups
           if (group.children.length > 0 && !group.children[0].groupName) {
             // Children are rows
             result = result.concat(group.children);
           } else {
             // Children are subgroups
             result = result.concat(this.flattenGroupedData(group.children));
           }
        }
      } else {
        // Should not happen if structure is correct, but as fallback
        result.push(group);
      }
    });

    console.log(result);
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
}
