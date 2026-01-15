import {Component, Input, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {GridTextCellMenuComponent} from "../grid-text-cell-menu/grid-text-cell-menu.component";
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {ToFreeTextCellPipe} from "../../pipes/to-text-cell.pipe";
import {isFreeTextCell, PrFreeTextCell } from '../../types/grid.interface';

@Component({
  selector: 'pr-grid-text-cell',
  standalone: true,
  imports: [CommonModule, GridTextCellMenuComponent, MatMenuModule, ToFreeTextCellPipe],
  templateUrl: './grid-text-cell.component.html',
  styleUrls: ['./grid-text-cell.component.less']
})
export class GridTextCellComponent {
  @Input() cell: PrFreeTextCell;
  @Input() columnDef: string;
  @Input() columnTitle: string;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  onDoubleClick(): void {
    if(isFreeTextCell(this.cell) && this.cell.onEdit) {
      this.trigger.openMenu();
    }
  }

  onSave(value: string) {
    this.trigger.closeMenu();

    if(isFreeTextCell(this.cell)) {
      this.cell?.onEdit(value);
    }
  }

  onCancel() {
    this.trigger.closeMenu();
  }
}
