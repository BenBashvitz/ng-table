import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {GridComponent} from '../grid/components/grid/grid.component';
import {TableComponent} from './table/table.component';

const examples = [
  TableComponent,
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
