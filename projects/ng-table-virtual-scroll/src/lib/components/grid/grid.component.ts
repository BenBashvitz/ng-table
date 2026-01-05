import {
  Component, ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output, QueryList,
  SimpleChanges,
  ViewChild, ViewChildren
} from '@angular/core';
import {
  defaults,
  isCustomCell,
  isNormalCell,
  PrCell,
  PrColumn,
  PrColumnGroup,
  PrColumnWithMetadata,
  PrRow,
  PrTable
} from "../../types/table.interface";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {NgClass, NgComponentOutlet, NgForOf, NgIf} from "@angular/common";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";
import {TableCellPipe} from "../../pipes/table-cell.pipe";
import {ToNormalCellPipe} from "../../pipes/to-normal-cell.pipe";
import {ToComponentCellPipe} from "../../pipes/to-component-cell.pipe";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray
} from "@angular/cdk/drag-drop";

@Component({
  selector: 'tvs-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.less'],
  standalone: true,
  imports: [
    CdkVirtualScrollViewport,
    MatTableModule,
    NgForOf,
    NgIf,
    NgComponentOutlet,
    ColumnResizeDirective,
    TableCellPipe,
    ToNormalCellPipe,
    ToComponentCellPipe,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    NgClass,
    CdkDragPreview,
  ]
})
export class GridComponent implements OnChanges, OnInit {
  @Input() table: PrTable
  @Output() selectedRows = new EventEmitter<PrRow[]>();
  @Output() dblclickRow = new EventEmitter<PrRow>();
  @ViewChildren('scroll', {read: ElementRef}) scrollViews: QueryList<ElementRef<Element>>;
  @ViewChild('body') body: ElementRef<Element>
  @ViewChild(CdkVirtualScrollViewport)
  cdkVirtualScrollViewport: CdkVirtualScrollViewport

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const element = event.target as Element;

    if (!this.body.nativeElement.contains(element)) {
      this.table.selectedRowsIds = [];
      this.selectedRows.emit([])
    }
  }

  defaults = defaults;
  groupedSelectedRows: Array<Array<number>> = []
  groupToColumnAmountMap: Record<string, string> = {}
  columnGroups: PrColumnGroup[] = []

  ngOnInit() {
    this.initTable(this.table);
    this.setGroupToColumnAmountMap(this.table);
    this.setColumnGroups(this.table);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['table']) {
      this.initTable(this.table);
      this.setGroupToColumnAmountMap(this.table);
      this.setColumnGroups(this.table);
    }
  }

  get tableColumns(): PrColumnWithMetadata[] {
    return this.columnGroups.reduce((columns, group) => {
      columns.push(...group.columns)
      return columns
    }, [] as PrColumnWithMetadata[])
  }

  get gridTemplate() {
    return this.tableColumns.map(col => {
      console.log(`${col.widthInPx ?? defaults.widthInPx}px`)
      return `${col.widthInPx ?? defaults.widthInPx}px`
    }).join(' ');
  }

  getStickyLeft(index: number): number {
    let left = 0;

    for (let i = 0; i < index; i++) {
      const column = this.tableColumns[i]
      if (column.isSticky) {
        left += column.widthInPx + 2;
      }
    }

    return left;
  }

  getGroupStickyLeft(group: PrColumnGroup) {
    const index = this.tableColumns.indexOf(group.columns[0]);

    return this.getStickyLeft(index);
  }

  isCustomCell(cell: PrCell) {
    return isCustomCell(cell)
  }

  isNormalCell(cell: PrCell) {
    return isNormalCell(cell)
  }

  trackByColumn(_: number, column: PrColumnWithMetadata) {
    return column.columnDef
  }

  trackByRow(_: number, row: PrRow) {
    return row.id
  }

  onDragStart() {
    document.body.style.cursor = 'grabbing';
  }

  onDragEnd() {
    document.body.style.cursor = 'unset';
  }

  onDropColumn(event: CdkDragDrop<unknown, unknown, PrColumn>) {
    const group = this.getColumnGroupByColumn(event.item.data);
    const column = this.tableColumns.find((_, index) => event.currentIndex === index)
    const previousIndex = group.columns.findIndex(({columnDef}) => event.item.data.columnDef === columnDef);
    const currentIndex = group.columns.findIndex(({columnDef}) => column.columnDef === columnDef);

    if (currentIndex === -1) return;

    moveItemInArray(group.columns, previousIndex, currentIndex)
  }

  onDropGroup(event: CdkDragDrop<unknown, unknown, PrColumnGroup>) {
    moveItemInArray(this.columnGroups, event.previousIndex, event.currentIndex);
    this.setGroupToColumnAmountMap(this.table);
  }

  onDropRow(event: CdkDragDrop<unknown, unknown, PrRow>) {
    const previousIndex = this.table.rows.findIndex(({id}) => event.item.data.id === id);
    moveItemInArray(this.table.rows, previousIndex, previousIndex + event.currentIndex - event.previousIndex);
    this.table.rows = [...this.table.rows];
  }

  onClickRow(event: MouseEvent, row: PrRow) {
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
      this.table.selectedRowsIds = [row.id];
    } else if (!event.shiftKey) {
      this.handleControlClickOnRow(row)
    } else {
      this.handleShiftClickOnRow(row)
    }

    this.groupedSelectedRows = this.groupSelectedRows();
    this.selectedRows.emit(this.table.selectedRowsIds.map(selectedRowId => this.table.rows.find(({id}) => selectedRowId === id)));
  }

  onDoubleClickRow(row: PrRow) {
    this.dblclickRow.emit(row);
  }

  onScroll(event: Event) {
    const scrollLeft = (event.target as Element).scrollLeft;

    this.scrollViews.forEach((scrollView) => {
      scrollView.nativeElement.scrollLeft = scrollLeft;
    })
  }

  private initTable(table: PrTable) {
    this.table = {
      selectedRowsIds: [],
      pinnedRowsIds: [],
      selectedCells: [],
      groupByColumnIds: [],
      sortByColumn: [],
      columnOrder: [],
      ...table,
      columnGroups: table.columnGroups.map(group => ({
        ...group,
        columns: group.columns.map(column => ({
          ...column,
          widthInPx: column.widthInPx ?? defaults.widthInPx,
        }))
      })),
    }
  }

  private setColumnGroups(table: PrTable) {
    this.columnGroups = []

    table.columnGroups.forEach(columnGroup => {
      let dividedGroup: PrColumnGroup[] = []

      columnGroup.columns
        .forEach((column, index) => {
        if(!column.isSticky) {
          if(dividedGroup.length === 0 || dividedGroup[dividedGroup.length - 1].isSticky) {
            dividedGroup = [...dividedGroup, {
              columnDef: columnGroup.columnDef + `-${index}`,
              title: columnGroup.title,
              columns: [column],
              isSticky: false
            }]
          } else {
            dividedGroup[dividedGroup.length - 1].columns.push(column);
            dividedGroup[dividedGroup.length - 1].columnDef = dividedGroup[dividedGroup.length - 1].columnDef + `-${index}`
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

      if(dividedGroup[dividedGroup.length - 1].columns.length === 0) dividedGroup.pop()

      this.columnGroups = [...this.columnGroups, ...dividedGroup]
    })
  }

  private setGroupToColumnAmountMap(table: PrTable) {
    let previousColumnAmount = 1

    this.groupToColumnAmountMap = this.columnGroups.reduce((groupToColumnAmount, group) => {
      const columnAmountInGroup = group.columns.length

      groupToColumnAmount[group.columnDef] = `${previousColumnAmount} / ${columnAmountInGroup + previousColumnAmount}`
      previousColumnAmount = columnAmountInGroup + previousColumnAmount;

      return groupToColumnAmount
    }, {} as Record<string, string>)
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
    } else if (this.table.selectedRowsIds.length === 1 && this.table.selectedRowsIds[0] === row.id) {
      this.table.selectedRowsIds = []
    } else {
      const firstSelectedRowId = this.table.selectedRowsIds[0]
      const firstSelectedRowIndex = this.table.rows.findIndex((row) => row.id === firstSelectedRowId);
      const currentRowIndex = this.table.rows.findIndex((tableRow) => tableRow.id === row.id);

      const startIndex = Math.min(currentRowIndex, firstSelectedRowIndex);
      const endIndex = Math.max(currentRowIndex, firstSelectedRowIndex);

      this.table.selectedRowsIds = [firstSelectedRowId, ...this.table.rows.filter((row, index) => index >= startIndex && index <= endIndex && index !== firstSelectedRowIndex).map(({id}) => id)]
    }
  }

  private getColumnGroupByColumn(column: PrColumn) {
    return this.columnGroups.find(({columns}) => columns.includes(column));
  }

  private groupSelectedRows() {
    return this.table.rows.filter(({id}) => this.table.selectedRowsIds.includes(id)).reduce((groupedRows, row, i) => {
      const index = this.table.rows.findIndex((rowToFind) => rowToFind.id === row.id);
      if (i === 0 || index !== groupedRows[groupedRows.length - 1][groupedRows[groupedRows.length - 1].length - 1] + 1) {
        groupedRows.push([index])
      } else {
        groupedRows[groupedRows.length - 1].push(index)
      }

      return groupedRows
    }, [] as Array<Array<number>>)
  }

  getRowIndex(rowId: string | number) {
    return this.table.rows.findIndex((row) => row.id === rowId) - this.cdkVirtualScrollViewport.getRenderedRange().start
  }
}
