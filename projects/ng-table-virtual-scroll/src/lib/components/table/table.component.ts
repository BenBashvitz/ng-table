import {ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TableVirtualScrollDataSource} from "../../services/table-data-source";
import {defaults, isCustomCell, isNormalCell, PrCell, PrColumnWithMetadata, PrRow, PrTable} from "../../types/table.interface";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import { NgComponentOutlet, NgForOf, NgIf } from "@angular/common";
import {TableItemSizeDirective} from "../../directives/table-item-size.directive";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";
import {TableSizeDirective} from "../../directives/table-size.directive";
import {TableCellPipe} from "../../pipes/table-cell.pipe";
import {ToNormalCellPipe} from "../../pipes/to-normal-cell.pipe";
import {ToComponentCellPipe} from "../../pipes/to-component-cell.pipe";

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
  groupDefs: string[] = []
  groupToColumnAmountMap: Record<string, number> = {}
  dataSource = new TableVirtualScrollDataSource([]);
  defaults = defaults;

  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.initDatasource(this.table);
    this.initColumns(this.table);
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['table']) {
      this.initDatasource(this.table);
      this.initColumns(this.table);
      this.cd.detectChanges();
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
    this.columnDefs = table.columns.map(({columnDef}) => columnDef);
  }

  private setGroupDefs(table: PrTable) {
    this.groupToColumnAmountMap = table.columnGroups.reduce((groupToColumnAmount, group) => {
      const shownColumnsInGroup = group.columns.filter(groupColumn => this.columnDefs.includes(groupColumn)).length

      if(shownColumnsInGroup > 0) groupToColumnAmount[group.columnDef] = shownColumnsInGroup

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

  trackByColumnDef(_:number, column: PrColumnWithMetadata) {
    return column.columnDef
  }
}
