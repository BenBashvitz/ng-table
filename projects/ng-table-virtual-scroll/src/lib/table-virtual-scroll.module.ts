import {NgModule} from '@angular/core';
import {TableItemSizeDirective} from './directives/table-item-size.directive';
import {CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {JsonPipe, NgClass, NgComponentOutlet, NgForOf, NgIf, NgStyle} from "@angular/common";
import {ColumnResizeDirective} from './directives/column-resize.directive';
import {GridComponent} from "./components/grid/grid.component";
import { GridCellComponent } from './components/grid-cell/grid-cell.component';
import {TableCellPipe} from "./pipes/table-cell.pipe";
import {ToComponentCellPipe} from "./pipes/to-component-cell.pipe";
import {ToNormalCellPipe} from "./pipes/to-normal-cell.pipe";
import { GridRowComponent } from './components/grid-row/grid-row.component';
import {CdkDrag, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import { GridHeaderRowComponent } from './components/grid-header-row/grid-header-row.component';
import { GridCellEditMenuComponent } from './components/grid-cell-edit-menu/grid-cell-edit-menu.component';
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [
    GridComponent,
    TableItemSizeDirective,
    ColumnResizeDirective,
    CdkVirtualScrollViewport,
    MatTableModule,
    NgForOf,
    NgIf,
    NgComponentOutlet,
    JsonPipe,
    NgStyle,
    TableCellPipe,
    ToComponentCellPipe,
    ToNormalCellPipe,
    NgClass,
    CdkDrag,
    CdkVirtualForOf,
    GridCellComponent,
    CdkDragPreview,
    CdkDropList,
    FormsModule
  ],
  exports: [TableItemSizeDirective, ColumnResizeDirective, GridComponent],
})
export class TableVirtualScrollModule {
}
