import {ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TableVirtualScrollDataSource} from "../table-data-source";
import {defaults, isCustomCell, isNormalCell, PrCell, PrColumn, PrRow, PrTable} from "../table.interface";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {JsonPipe, NgComponentOutlet, NgForOf, NgIf, NgStyle} from "@angular/common";
import {TableItemSizeDirective} from "../table-item-size.directive";
import {ColumnResizeDirective} from "../column-resize.directive";
import {TableSizeDirective} from "../table-size.directive";
import {TableCellPipe} from "../table-cell.pipe";
import {ToNormalCellPipe} from "../to-normal-cell.pipe";
import {ToComponentCellPipe} from "../to-component-cell.pipe";

@Component({
  selector: 'tvs-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
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
  ]
})
export class TableComponent implements OnChanges, OnInit {
  _table: PrTable;
  @Input() table: PrTable
  columnDefs: string[] = []
  dataSource = new TableVirtualScrollDataSource([]);
  defaults = defaults;

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.initDatasource(this.table);
    this.setColumnDefs(this.table);

    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['table']) {
      this.initDatasource(this.table);
      this.setColumnDefs(this.table);
      this.cd.detectChanges();
    }
  }

  initTable() {
    this._table = {
      ...this.table,
    }
  }

  private initDatasource(table: PrTable) {
    if (this.dataSource) {
      this.dataSource.data = table.rows;
    } else {
      this.dataSource = new TableVirtualScrollDataSource(table.rows);
    }
  }

  private setColumnDefs(table: PrTable) {
    this.columnDefs = table.columns.map(({columnDef}) => columnDef);
  }

  isCustomCell(cell: PrCell) {
    return isCustomCell(cell)
  }

  isNormalCell(cell: PrCell) {
    return isNormalCell(cell)
  }

  trackByColumnDef(_:number, column: PrColumn) {
    return column.columnDef
  }
}
