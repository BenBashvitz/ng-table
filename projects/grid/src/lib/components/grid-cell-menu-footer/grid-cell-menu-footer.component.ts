import {Component, EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pr-grid-cell-menu-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-cell-menu-footer.component.html',
  styleUrls: ['./grid-cell-menu-footer.component.less']
})
export class GridCellMenuFooterComponent {
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
}
