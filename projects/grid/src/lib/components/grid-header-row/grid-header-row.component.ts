import {Component, Input, QueryList, ViewChildren} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {ColumnResizeDirective} from "../../directives/column-resize.directive";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import { PrColumn, PrColumnGroup, PrColumnWithMetadata, PrSortColumn, PrSortDirection } from '@parlament/grid';
import {GridStore} from "../../store/grid.store";
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {MatOptionModule} from "@angular/material/core";
import {GridColumnGroupSpacerComponent} from "../grid-column-group-spacer/grid-column-group-spacer.component";
import { MatIconModule } from '@angular/material/icon';
import { ToggleLabelPipe } from '../../pipes/toggle-label.pipe';
import { FindByPropPipe } from '../../pipes/find-by-prop.pipe';
import {actionsColumnDef} from "../../types/grid.constants";

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
    GridColumnGroupSpacerComponent,
    NgIf,
    ToggleLabelPipe,
    MatIconModule,
    FindByPropPipe,
    MatIconModule
  ]
})
export class GridHeaderRowComponent {
  @Input() columnGroups: PrColumnGroup[];
  @Input() gridTemplateColumns: string;
  @Input() gridMaxWidth: number;
  @Input() gridWidth: number;
  @Input() groupByColumnIds: string[];
  @Input() sortByColumns: PrSortColumn[];
  @Input() sortByDirection: PrSortDirection;
  @ViewChildren(MatMenuTrigger) menuTriggers: QueryList<MatMenuTrigger>;

  protected readonly actionsColumnDef = actionsColumnDef;

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
    return column.columnDef;
  }

  onClickColumn(column: PrColumn) {
    this.onSelectColumn(column);
    this.onSortAction(column.columnDef);
  }

  onContextMenuColumn(event: Event, column: PrColumn, groupIndex: number, columnIndex: number) {
    event.stopPropagation();
    event.preventDefault();
    this.onSelectColumn(column);
    this.menuTriggers.get(this.getColumnIndex(groupIndex, columnIndex)).openMenu();
  }

  onRemoveColumn(column: PrColumnWithMetadata) {
    this.gridStore.removeColumn(column);
  }

  onCopyColumn(column: PrColumnWithMetadata) {
    this.gridStore.copyColumn(column);
  }

  getColumnIndex(groupIndex: number, columnInGroupIndex: number) {
    return this.columnGroups.reduce((columnIndex, _, i) => {
      if (i < groupIndex) {
        return columnIndex + this.columnGroups[i].columns.length;
      } else if (i > groupIndex) {
        return columnIndex;
      } else {
        return columnIndex + columnInGroupIndex;
      }
    }, 0);
  }

  onGroupByAction(columnDef: string) {
    if (this.groupByColumnIds.includes(columnDef)) {
      this.gridStore.removeGroupByColumnId(columnDef);
    } else {
      this.gridStore.addGroupByColumnId(columnDef);
    }

    this.gridStore.updateAllRows();
  }

  onSortAction(columnDef: string) {
    this.gridStore.toggleOrAddSortColumn(columnDef);
    this.gridStore.sortRows();
  }

  onRemoveSortByColumn(columnDef: string) {
    this.gridStore.removeSortByColumnId(columnDef);
    this.gridStore.sortRows();
  }

  onSelectColumn(column: PrColumn) {
    this.gridStore.setSelectedColumn(column);
  }
}
