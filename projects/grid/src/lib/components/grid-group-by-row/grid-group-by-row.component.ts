import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PrGroupByRow } from '@parlament/grid';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'pr-grid-group-by-row',
  templateUrl: './grid-group-by-row.component.html',
  styleUrls: ['./grid-group-by-row.component.less'],
  imports: [NgIf, MatIconModule],
  standalone: true,
})
export class GridGroupByRowComponent {
  @Input() groupByRow: PrGroupByRow;
  @Input() gridTemplateColumns: string
  @Input() columnsLength: number;
  @Output() toggle = new EventEmitter<PrGroupByRow>();

  toggleOpen(): void {
    this.toggle.emit(this.groupByRow);
  }
}
