import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {GridComponent} from '../grid/components/grid/grid.component';
import {BasicGridExample} from './basic-grid-example/basic-grid-example.component';
import {BasicDarkGridExample} from "./basic-dark-grid-example/basic-dark-grid-example.component";
import {EditableCellGridExampleComponent} from "./editable-cell-grid-example/editable-cell-grid-example.component";

const examples = [
  BasicGridExample,
  BasicDarkGridExample,
  EditableCellGridExampleComponent
];

@NgModule({
  declarations: [
    ...examples,
  ],
  imports: [
    CommonModule,
    GridComponent,
    CdkTableModule,
    MatTableModule,
    ScrollingModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [
    ...examples
  ]
})
export class ExamplesModule {
}
