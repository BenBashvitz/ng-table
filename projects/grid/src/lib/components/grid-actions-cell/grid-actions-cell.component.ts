import {Component, Input, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PrActionsCell, PrGridAction} from "../../types/grid.interface";
import {MatDividerModule} from "@angular/material/divider";
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {MatOptionModule} from "@angular/material/core";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'pr-grid-actions-cell',
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatMenuModule, MatOptionModule, MatIconModule],
  templateUrl: './grid-actions-cell.component.html',
  styleUrls: ['./grid-actions-cell.component.less']
})
export class GridActionsCellComponent {
  @Input() cell: PrActionsCell
  @Input() columnDef: string;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  onClickOption(action: PrGridAction) {
    action.onAction()
  }
}
