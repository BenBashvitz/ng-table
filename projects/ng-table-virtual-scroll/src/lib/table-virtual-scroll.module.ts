import {NgModule} from '@angular/core';
import {TableItemSizeDirective} from './directives/table-item-size.directive';
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {JsonPipe, NgComponentOutlet, NgForOf, NgIf, NgStyle} from "@angular/common";
import {ColumnResizeDirective} from './directives/column-resize.directive';
import {GridComponent} from "./components/grid/grid.component";

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
    NgStyle
  ],
  exports: [TableItemSizeDirective, ColumnResizeDirective, GridComponent],
  declarations: [

  ],
})
export class TableVirtualScrollModule {
}
