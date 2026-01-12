import {Component, Input, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {PrOptionsCell} from "@parlament/grid";
import {MatOptionModule} from "@angular/material/core";
import {MatListModule} from "@angular/material/list";

@Component({
  selector: 'pr-grid-options-cell',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatOptionModule, MatListModule],
  templateUrl: './grid-options-cell.component.html',
  styleUrls: ['./grid-options-cell.component.less']
})
export class GridOptionsCellComponent {
  @Input() cell: PrOptionsCell;
  @Input() columnDef: string;
  @Input() columnTitle: string;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  onDoubleClick(): void {
    if (this.cell.onEdit) {
      this.trigger.openMenu();
    }
  }

  onClickOption(option: string) {
    this.trigger.closeMenu();

    this.cell?.onEdit(option);
  }
}
