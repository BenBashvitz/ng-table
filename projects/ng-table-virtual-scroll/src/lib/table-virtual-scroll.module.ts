import {NgModule} from '@angular/core';
import {TableItemSizeDirective} from './table-item-size.directive';
import {TableComponent} from './table/table.component';
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatTableModule} from "@angular/material/table";
import {JsonPipe, NgComponentOutlet, NgForOf, NgIf, NgStyle} from "@angular/common";
import {ColumnResizeDirective} from './column-resize.directive';

@NgModule({
  imports: [
    TableComponent,
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
  exports: [TableItemSizeDirective, TableComponent, ColumnResizeDirective],
})
export class TableVirtualScrollModule {
}
