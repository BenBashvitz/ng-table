import {Component, Input, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";
import {AsyncPipe, NgForOf} from "@angular/common";
import {PrColumn, PrColumnWithMetadata} from "@parlament/grid";
import {GridStore} from "../../store/grid.store";
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {MatOptionModule} from "@angular/material/core";
import {GridCellComponent} from "../grid-cell/grid-cell.component";
import {IsCellSelectedPipe} from "../../pipes/is-cell-selected.pipe";
import {IsColumnSelectedPipe} from "../../pipes/is-column-selected.pipe";

@Component({
  selector: 'pr-grid-header-row',
  templateUrl: './grid-header-row.component.html',
  styleUrls: ['./grid-header-row.component.less'],
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    ColumnResizeDirective,
    CdkDragPreview,
    NgForOf,
    AsyncPipe,
    MatMenuModule,
    MatOptionModule,
    GridCellComponent,
    IsCellSelectedPipe,
    IsColumnSelectedPipe
  ]
})
export class GridHeaderRowComponent {
  @Input() columns: PrColumnWithMetadata[]
  @Input() gridTemplateColumns: string
  @Input() gridMaxWidth: number;
  @Input() gridWidth: number;
  @ViewChildren(MatMenuTrigger) menuTriggers: QueryList<MatMenuTrigger>;

  constructor(public gridStore: GridStore) {}

  onDropColumn(event: CdkDragDrop<unknown, unknown, PrColumn>) {
    this.gridStore.moveColumn({
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

  trackByColumn(_: number, column: PrColumnWithMetadata) {
    return column.columnDef
  }

  onClickColumn(column: PrColumnWithMetadata) {
    this.gridStore.setSelectedColumn(column);
  }

  onContextMenuColumn(event: Event, column: PrColumn, columnIndex: number) {
    event.stopPropagation();
    event.preventDefault();
    this.onClickColumn(column);
    this.menuTriggers.get(columnIndex).openMenu()
  }

  onRemoveColumn(column: PrColumnWithMetadata) {
    this.gridStore.removeColumn(column);
  }

  onCopyColumn(column: PrColumnWithMetadata) {
    this.gridStore.copyColumn(column);
  }
}
