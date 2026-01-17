import { Component, Input , QueryList, ViewChildren} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPreview,
  CdkDropList
} from '@angular/cdk/drag-drop';
import { PrColumnGroup } from '../../types/grid.interface';
import { GridStore } from '../../store/grid.store';
import { ColumnResizeDirective } from '../../directives/column-resize.directive';
import { SumPipe } from '../../pipes/sum.pipe';
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {MatOptionModule} from "@angular/material/core";
import {GridColumnGroupSpacerComponent} from "../grid-column-group-spacer/grid-column-group-spacer.component";

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
    , MatMenuModule, MatOptionModule, GridColumnGroupSpacerComponent, NgIf],
  templateUrl: './grid-column-group-row.component.html',
  styleUrls: ['./grid-column-group-row.component.less']
})
export class GridColumnGroupRowComponent {
  @Input() columnGroups: PrColumnGroup[];
  @Input() gridTemplateColumns: string;
  @Input() gridMaxWidth: number;
  @Input() gridWidth: number;
  @ViewChildren(MatMenuTrigger) menuTriggers: QueryList<MatMenuTrigger>;

  constructor(public gridStore: GridStore) {}

  onDropColumnGroup(event: CdkDragDrop<unknown, unknown, PrColumnGroup>) {
    this.gridStore.moveColumnGroup({
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

  onContextMenu(columnIndex: number) {
    this.menuTriggers.get(columnIndex).openMenu();
  }

  onRemoveColumnGroup(columnGroup: PrColumnGroup) {
    this.gridStore.removeColumnGroup(columnGroup);
  }
}
