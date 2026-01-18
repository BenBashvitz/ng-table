import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {CommonModule} from '@angular/common';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { GridStore, isEditableCell, PrOptionsCell } from '@parlament/grid';
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
  @Output() rightClick = new EventEmitter<void>();
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(public gridStore: GridStore) {}

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (isEditableCell(this.cell) && this.cell.onEdit) {
      this.rightClick.emit();
      this.trigger.openMenu();
    }
  }

  onClickOption(option: string) {
    this.trigger.closeMenu();
    this.gridStore.editCells({ triggerCell: this.cell, value: option, columnDef: this.columnDef });
  }
}
