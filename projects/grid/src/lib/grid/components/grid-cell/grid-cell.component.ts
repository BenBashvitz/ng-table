import {Component, Input, ViewChild} from '@angular/core';
import {isCustomCell, isNormalCell, PrCell} from "../../types/grid.interface";
import {NgClass, NgComponentOutlet, NgIf} from "@angular/common";
import {ToNormalCellPipe} from "../../pipes/to-normal-cell.pipe";
import {ToComponentCellPipe} from "../../pipes/to-component-cell.pipe";
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {GridCellEditMenuComponent} from "../grid-cell-edit-menu/grid-cell-edit-menu.component";

@Component({
  selector: 'pr-grid-cell',
  templateUrl: './grid-cell.component.html',
  styleUrls: ['./grid-cell.component.less'],
  imports: [
    NgClass,
    NgIf,
    NgComponentOutlet,
    ToNormalCellPipe,
    ToComponentCellPipe,
    MatMenuModule,
    GridCellEditMenuComponent
  ],
  standalone: true
})
export class GridCellComponent {
  @Input() cell: PrCell;
  @Input() columnDef: string;
  @Input() columnTitle: string;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  protected readonly isCustomCell = isCustomCell;
  protected readonly isNormalCell = isNormalCell;

  onDoubleClick(): void {
    if(isNormalCell(this.cell) && this.cell.onEdit) {
      this.trigger.openMenu();
    }
  }

  onSave(value: string) {
    this.trigger.closeMenu();

    if(isNormalCell(this.cell)) {
      this.cell?.onEdit(value);
    }
  }

  onCancel() {
    this.trigger.closeMenu();
  }
}
