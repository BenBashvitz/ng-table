import {Component, Input, OnInit} from '@angular/core';
import {PrColumnGroup, PrColumnWithMetadata, PrTable} from "../../types/table.interface";
import {MatTableModule} from "@angular/material/table";
import {AsyncPipe, NgForOf} from "@angular/common";
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {GridColumnGroupComponent} from "../grid-column-group/grid-column-group.component";
import {TableStore} from "../../store/table.store";
import {Observable} from "rxjs";

@Component({
  selector: 'tvs-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.less'],
  standalone: true,
  imports: [
    MatTableModule,
    NgForOf,
    CdkDropList,
    CdkDrag,
    CdkDragPreview,
    GridColumnGroupComponent,
    AsyncPipe,
    GridColumnGroupComponent,
    GridColumnGroupComponent,
  ],
  providers: [TableStore]
})
export class GridComponent implements OnInit {
  @Input() table: PrTable
  splitColumnGroups: Observable<PrColumnGroup[]>;

  constructor(public tableStore: TableStore) {}

  ngOnInit() {
    this.tableStore.setTable(this.table);
    this.splitColumnGroups = this.tableStore.columnGroups$;
  }

  trackByColumn(_: number, column: PrColumnWithMetadata) {
    return column.columnDef
  }

  onDragStart() {
    document.body.style.cursor = 'grabbing';
  }

  onDragEnd() {
    document.body.style.cursor = 'unset';
  }

  onDropGroup(event: CdkDragDrop<unknown, unknown, PrColumnGroup>) {
    this.tableStore.moveColumnGroup({item: event.item.data, previousIndex: event.previousIndex, currentIndex: event.currentIndex});
  }
}
