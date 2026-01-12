import {Component, Input} from '@angular/core';
import {PrCellType} from "../../types/grid.interface";
import {NgComponentOutlet, NgIf, NgSwitch, NgSwitchCase} from "@angular/common";
import {ToFreeTextCellPipe} from "../../pipes/to-text-cell.pipe";
import {ToComponentCellPipe} from "../../pipes/to-component-cell.pipe";
import {MatMenuModule} from "@angular/material/menu";
import {GridTextCellComponent} from "../grid-text-cell/grid-text-cell.component";
import {GridOptionsCellComponent} from "../grid-options-cell/grid-options-cell.component";
import {ToOptionsCellPipe} from "../../pipes/to-options-cell.pipe";

@Component({
  selector: 'pr-grid-cell',
  templateUrl: './grid-cell.component.html',
  styleUrls: ['./grid-cell.component.less'],
  imports: [
    NgIf,
    NgComponentOutlet,
    ToFreeTextCellPipe,
    ToComponentCellPipe,
    MatMenuModule,
    GridTextCellComponent,
    NgSwitchCase,
    NgSwitch,
    GridOptionsCellComponent,
    ToOptionsCellPipe
  ],
  standalone: true
})
export class GridCellComponent {
  @Input() cell: PrCellType;
  @Input() columnDef: string;
  @Input() columnTitle: string;
}
