import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {PrColumnGroup} from "ng-table-virtual-scroll";
import {TableStore} from "../../store/table.store";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";

@Component({
  selector: 'tvs-grid-column-group-row',
  standalone: true,
  imports: [CdkDrag, CdkDragPreview, CdkDropList, ColumnResizeDirective, NgForOf],
  templateUrl: './grid-column-group-row.component.html',
  styleUrls: ['./grid-column-group-row.component.less']
})
export class GridColumnGroupRowComponent {
  @Input() columnGroups: PrColumnGroup[]
  @Input() gridTemplateColumns: string

  constructor(public tableStore: TableStore) {}

  onDropColumnGroup(event: CdkDragDrop<unknown, unknown, PrColumnGroup>) {
    this.tableStore.moveColumnGroup({item: event.item.data, previousIndex: event.previousIndex, currentIndex: event.currentIndex});
  }

  onDragStart() {
    document.body.style.cursor = 'grabbing';
  }

  onDragEnd() {
    document.body.style.cursor = 'unset';
  }

  trackByColumn(_: number, group: PrColumnGroup) {
    return group.columnDef
  }
}
