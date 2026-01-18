import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridTextCellMenuComponent } from '../grid-text-cell-menu/grid-text-cell-menu.component';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { GridStore } from '@parlament/grid';
import { isEditableCell, PrFreeTextCell } from '../../types/grid.interface';

@Component({
  selector: 'pr-grid-text-cell',
  standalone: true,
  imports: [CommonModule, GridTextCellMenuComponent, MatMenuModule],
  templateUrl: './grid-text-cell.component.html',
  styleUrls: ['./grid-text-cell.component.less']
})
export class GridTextCellComponent {
  @Input() cell: PrFreeTextCell;
  @Input() columnDef: string;
  @Input() columnTitle: string;
  @Output() rightClick = new EventEmitter<void>();
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(public gridStore: GridStore) {}

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if(isEditableCell(this.cell) && this.cell.onEdit) {
      this.rightClick.emit();
      this.trigger.openMenu();
    }
  }

  onSave(value: string) {
    this.trigger.closeMenu();
    this.gridStore.editCells({ triggerCell: this.cell, value: value, columnDef: this.columnDef });
  }

  onCancel() {
    this.trigger.closeMenu();
  }
}
