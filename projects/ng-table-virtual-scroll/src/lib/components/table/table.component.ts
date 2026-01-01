import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {TableVirtualScrollDataSource} from "../../services/table-data-source";
import {
  defaults,
  isColumnGroup,
  isCustomCell,
  isNormalCell,
  PrCell,
  PrColumn,
  PrColumnWithMetadata,
  PrRow,
  PrTable
} from "../../types/table.interface";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {NgComponentOutlet, NgForOf, NgIf} from "@angular/common";
import {TableItemSizeDirective} from "../../directives/table-item-size.directive";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";
import {TableSizeDirective} from "../../directives/table-size.directive";
import {TableCellPipe} from "../../pipes/table-cell.pipe";
import {ToNormalCellPipe} from "../../pipes/to-normal-cell.pipe";
import {ToComponentCellPipe} from "../../pipes/to-component-cell.pipe";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragEnter,
  CdkDragPlaceholder,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray
} from "@angular/cdk/drag-drop";

@Component({
  selector: 'tvs-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.less'],
  standalone: true,
  imports: [
    CdkVirtualScrollViewport,
    MatTableModule,
    NgForOf,
    NgIf,
    NgComponentOutlet,
    TableItemSizeDirective,
    ColumnResizeDirective,
    TableSizeDirective,
    TableCellPipe,
    ToNormalCellPipe,
    ToComponentCellPipe,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDropListGroup,
  ]
})
export class TableComponent implements OnChanges, OnInit {
  @Input() table: PrTable
  columnDefs: string[] = []
  groupDefs: string[] = []
  groupToColumnAmountMap: Record<string, number> = {}
  dataSource = new TableVirtualScrollDataSource([]);
  currentHoveredColumn: PrColumn | null = null;

  @Output() selectedRows = new EventEmitter<PrRow[]>();

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent): void {
    const element = event.target as Element;

    if(element.tagName.toLowerCase() !== 'tr' && element.tagName.toLowerCase() !== 'td') {
      this.table.selectedRowsIds = [];
      this.selectedRows.emit([])
    }
  }

  defaults = defaults;

  ngOnInit() {
    this.initTable(this.table);
    this.initDatasource(this.table);
    this.initColumns(this.table);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['table']) {
      this.initDatasource(this.table);
      this.initColumns(this.table);
    }
  }

  private initTable(table: PrTable) {
    this.table = {
      selectedRowsIds: [],
      pinnedRowsIds: [],
      selectedCells: [],
      groupByColumnIds: [],
      sortByColumn: [],
      columnOrder: [],
      ...table
    }
  }

  private initDatasource(table: PrTable) {
    if (this.dataSource) {
      this.dataSource.data = table.rows;
    } else {
      this.dataSource = new TableVirtualScrollDataSource(table.rows);
    }
  }

  private initColumns(table: PrTable) {
    this.setColumnDefs(table);
    this.setGroupDefs(table);
  }

  private setColumnDefs(table: PrTable) {
    this.columnDefs = table.columnGroups.reduce((columnDefs, {columns}) => {
      columnDefs.push(...columns.filter(column => !!this.table.columns.find(({columnDef}) => column === columnDef)));
      return columnDefs
    }, [] as string[]);
  }

  private setGroupDefs(table: PrTable) {
    this.groupToColumnAmountMap = table.columnGroups.reduce((groupToColumnAmount, group) => {
      const shownColumnsInGroup = group.columns.filter(groupColumn => this.columnDefs.includes(groupColumn)).length

      if (shownColumnsInGroup > 0) groupToColumnAmount[group.columnDef] = shownColumnsInGroup

      return groupToColumnAmount
    }, {} as Record<string, number>)
    this.groupDefs = Object.keys(this.groupToColumnAmountMap)
  }

  isCustomCell(cell: PrCell) {
    return isCustomCell(cell)
  }

  isNormalCell(cell: PrCell) {
    return isNormalCell(cell)
  }

  trackByColumnDef(_: number, column: PrColumnWithMetadata) {
    return column.columnDef
  }

  onDropColumn(event: CdkDragDrop<unknown, unknown, PrColumn>, prColumn: PrColumn) {
    const group = this.getColumnGroupByColumn(event.item.data)
    const previousIndex = group.columns.findIndex((columnDef) => event.item.data.columnDef === columnDef);
    const currentIndex = group.columns.findIndex((columnDef) => prColumn.columnDef === columnDef);

    if (currentIndex === -1) return;

    this.moveColumnInArray(group.columns, previousIndex, currentIndex)
  }

  onDropGroup(event: CdkDragDrop<unknown, unknown, PrColumn>) {
    this.moveColumnInArray(this.table.columnGroups, event.previousIndex, event.currentIndex)
  }

  onDrop(event: CdkDragDrop<unknown, unknown, PrColumn>, column: PrColumn) {
    this.currentHoveredColumn = null;

    if (!event) return;

    if (isColumnGroup(event.item.data)) {
      this.onDropGroup(event);
    } else {
      this.onDropColumn(event, column);
    }
  }

  onEnter(event: CdkDragEnter<unknown, PrColumn>, column: PrColumn) {
    if (isColumnGroup(event.item.data)) {
      this.currentHoveredColumn = column;
      return;
    }

    const group = this.getColumnGroupByColumn(column)
    const isDraggedColumnInGroup = !!group.columns.find((columnDef) => event.item.data.columnDef === columnDef);

    if (!isDraggedColumnInGroup) {
      this.currentHoveredColumn = null
    } else {
      this.currentHoveredColumn = column;
    }
  }

  onClickRow(event: MouseEvent, row: PrRow) {
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
      this.table.selectedRowsIds = [row.id]
    } else if (!event.shiftKey) {
      this.handleControlClickOnRow(row)
    } else {
      this.handleShiftClickOnRow(row)
    }

    console.log(this.table.selectedRowsIds.map(selectedRowId => this.table.rows.find(({id}) => selectedRowId === id)))
    this.selectedRows.emit(this.table.selectedRowsIds.map(selectedRowId => this.table.rows.find(({id}) => selectedRowId === id)));
  }

  private handleControlClickOnRow(row: PrRow) {
    const isSelected = this.table.selectedRowsIds.includes(row.id);

    if (isSelected) {
      this.table.selectedRowsIds = this.table.selectedRowsIds.filter((rowId) => rowId !== row.id);
    } else {
      this.table.selectedRowsIds = [...this.table.selectedRowsIds, row.id]
    }
  }

  private handleShiftClickOnRow(row: PrRow) {
    if (this.table.selectedRowsIds.length === 0) {
      this.table.selectedRowsIds = [row.id]
    } else if(this.table.selectedRowsIds.length === 1 && this.table.selectedRowsIds[0] === row.id) {
      this.table.selectedRowsIds = []
    } else {
      const firstSelectedRowIndex = this.table.rows.findIndex((row) => row.id === this.table.selectedRowsIds[0]);
      const currentRowIndex = this.table.rows.findIndex((tableRow) => tableRow.id === row.id);

      const startIndex = Math.min(currentRowIndex, firstSelectedRowIndex);
      const endIndex = Math.max(currentRowIndex, firstSelectedRowIndex);

      this.table.selectedRowsIds = this.table.rows.filter((row, index) => index >= startIndex && index <= endIndex).map(({id}) => id)
    }
  }

  isRowSelected(row: PrRow) {
    return this.table.selectedRowsIds.find((id) => row.id === id)
  }

  private moveColumnInArray(columns: (string | PrColumn)[], previousIndex: number, currentIndex: number) {
    moveItemInArray(columns, previousIndex, currentIndex);
    this.initColumns(this.table);
  }

  private getColumnGroupByColumn(column: PrColumn) {
    return this.table.columnGroups.find(({columns}) => columns.includes(column.columnDef));
  }
}
