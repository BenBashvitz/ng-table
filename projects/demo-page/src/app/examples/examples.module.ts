import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {BasicGridExample} from './basic-grid-example/basic-grid-example.component';
import {BasicDarkGridExample} from "./basic-dark-grid-example/basic-dark-grid-example.component";
import {EditableCellGridExample} from "./editable-cell-grid-example/editable-cell-grid-example.component";
import {StickyColumnGridExample} from "./sticky-column-grid-example/sticky-column-grid-example.component";
import { GridComponent } from '@parlament/grid';
import { MatIconModule } from '@angular/material/icon';
import { GroupByGridExample } from './group-by-grid-example/group-by-grid-example.component';
import { SortByGridExample } from './sort-by-grid-example/sort-by-grid-example.component';
import {GridRowActionsExample} from "./grid-row-actions-example/grid-row-actions-example.component";

const examples = [
  BasicGridExample,
  BasicDarkGridExample,
  GroupByGridExample,
  SortByGridExample,
  EditableCellGridExample,
  StickyColumnGridExample,
  GridRowActionsExample
];

@NgModule({
  declarations: [...examples],
  imports: [
    CommonModule,
    GridComponent,
    CdkTableModule,
    MatTableModule,
    ScrollingModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    GridComponent,
    MatIconModule,
  ],
  exports: [...examples]
})
export class ExamplesModule {}
