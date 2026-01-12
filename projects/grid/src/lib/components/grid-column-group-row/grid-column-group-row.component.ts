import { Component, Input } from '@angular/core';
import { AsyncPipe, NgForOf } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPreview,
  CdkDropList
} from '@angular/cdk/drag-drop';
import { PrColumnGroup } from '@parlament/grid';
import { GridStore } from '../../store/grid.store';
import { ColumnResizeDirective } from '../../directives/column-resize.directive';
import { SumPipe } from '../../pipes/sum.pipe';

@Component({
  selector: 'pr-grid-column-group-row',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDragPreview,
    CdkDropList,
    ColumnResizeDirective,
    NgForOf,
    AsyncPipe,
    SumPipe
  ],
  templateUrl: './grid-column-group-row.component.html',
  styleUrls: ['./grid-column-group-row.component.less']
})
export class GridColumnGroupRowComponent {
  @Input() columnGroups: PrColumnGroup[];
  @Input() gridTemplateColumns: string;
  @Input() gridMaxWidth: number;
  @Input() gridWidth: number;

  constructor(public tableStore: GridStore) {}

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
    return group.columnDef;
  }
}
