import {Injectable} from "@angular/core";
import {columnDefaults, PrColumn, PrColumnGroup, PrRow, PrTable, tableDefaults} from "../types/table.interface";
import {moveItemInArray} from "@angular/cdk/drag-drop";

@Injectable({
  providedIn: 'root'
})
export class TableService {
  initializeTable(table: PrTable) {
    return this.divideColumnGroups(this.setTableColumnDefaultValues(this.setTableDefaultValues(table)));;
  }

  divideColumnGroups(table: PrTable): PrTable {
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

  changeColumnGroupOrder(table: PrTable, columnGroup: PrColumnGroup, previousIndex: number, currentIndex: number) {
    const actualPreviousIndex = table.columnGroups.indexOf(columnGroup);
    const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
    moveItemInArray(table.columnGroups, actualPreviousIndex, actualCurrentIndex);

    return table;
  }

  changeColumnOrder(table: PrTable, column: PrColumn, previousIndex: number, currentIndex: number) {
    const columnGroup = table.columnGroups.find(({columns}) => columns.includes(column));

    if (columnGroup) {
      const actualPreviousIndex = columnGroup.columns.indexOf(column);
      const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
      moveItemInArray(columnGroup.columns, actualPreviousIndex, actualCurrentIndex);
    }

    return table;
  }

  changeRowOrder(table: PrTable, row: PrRow, previousIndex: number, currentIndex: number) {
    const actualPreviousIndex = table.rows.indexOf(row);
    const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
    moveItemInArray(table.rows, actualPreviousIndex, actualCurrentIndex);

    return table;
  }

  private setTableDefaultValues(table: PrTable): PrTable {
    return {
      ...tableDefaults,
      ...table
    }
  }

  private setTableColumnDefaultValues(table: PrTable): PrTable {
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
