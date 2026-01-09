import {Component, Input} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";
import {AsyncPipe, NgForOf} from "@angular/common";
import {PrColumn, PrColumnWithMetadata} from "../../types/grid.interface";
import {GridStore} from "../../store/grid.store";

@Component({
  selector: 'tvs-grid-header-row',
  templateUrl: './grid-header-row.component.html',
  styleUrls: ['./grid-header-row.component.less'],
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    ColumnResizeDirective,
    CdkDragPreview,
    NgForOf,
    AsyncPipe
  ]
})
export class GridHeaderRowComponent {
  @Input() columns: PrColumnWithMetadata[]
  @Input() gridTemplateColumns: string

  constructor(public tableStore: GridStore) {}

  onDropColumn(event: CdkDragDrop<unknown, unknown, PrColumn>) {
    this.tableStore.moveColumn({item: event.item.data, previousIndex: event.previousIndex, currentIndex: event.currentIndex});
  }

  onDragStart() {
    document.body.style.cursor = 'grabbing';
  }

  onDragEnd() {
    document.body.style.cursor = 'unset';
  }

  trackByColumn(_: number, column: PrColumnWithMetadata) {
    return column.columnDef
  }
}
