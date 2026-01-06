import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";
import {NgForOf} from "@angular/common";
import {PrColumn, PrColumnWithMetadata, PrTable} from "ng-table-virtual-scroll";
import {TableStore} from "../../store/table.store";

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
    NgForOf
  ]
})
export class GridHeaderRowComponent {
  @Input() columns: PrColumnWithMetadata[]
  @Input() gridTemplateColumns: string

  constructor(public tableStore: TableStore) {}

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
