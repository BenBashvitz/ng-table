import {Component, Input} from '@angular/core';
import {AsyncPipe, NgForOf} from '@angular/common';
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {PrColumnGroup, PrColumnWithMetadata} from "@parlament/grid";
import {GridStore} from "../../store/grid.store";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";

@Component({
  selector: 'pr-grid-column-group-row',
  standalone: true,
  imports: [CdkDrag, CdkDragPreview, CdkDropList, ColumnResizeDirective, NgForOf, AsyncPipe],
  templateUrl: './grid-column-group-row.component.html',
  styleUrls: ['./grid-column-group-row.component.less']
})
export class GridColumnGroupRowComponent {
  @Input() columnGroups: PrColumnGroup[]
  @Input() gridTemplateColumns: string
  @Input() gridMaxWidth: number;
  @Input() gridWidth: number;

  constructor(public tableStore: GridStore) {
  }

  getColumnGroupMinMaxWidth(columns: PrColumnWithMetadata[], isMaxWidth = true): number {
    return columns.reduce((sum, col) => sum + (isMaxWidth ? col.maxWidthInPx : col.minWidthInPx), 0)
  }

  onDropColumnGroup(event: CdkDragDrop<unknown, unknown, PrColumnGroup>) {
    this.tableStore.moveColumnGroup({
      item: event.item.data,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex
    });
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
