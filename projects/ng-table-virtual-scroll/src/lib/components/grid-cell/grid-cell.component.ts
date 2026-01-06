import {Component, Input} from '@angular/core';
import {isCustomCell, isNormalCell, PrCell} from "ng-table-virtual-scroll";
import {NgClass, NgComponentOutlet, NgIf} from "@angular/common";
import {ToNormalCellPipe} from "../../pipes/to-normal-cell.pipe";
import {ToComponentCellPipe} from "../../pipes/to-component-cell.pipe";

@Component({
  selector: 'tvs-grid-cell',
  templateUrl: './grid-cell.component.html',
  styleUrls: ['./grid-cell.component.less'],
  imports: [
    NgClass,
    NgIf,
    NgComponentOutlet,
    ToNormalCellPipe,
    ToComponentCellPipe
  ],
  standalone: true
})
export class GridCellComponent {
  @Input() cell: PrCell
  @Input() columnDef: string
  protected readonly isCustomCell = isCustomCell;
  protected readonly isNormalCell = isNormalCell;
}
