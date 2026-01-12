import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {GridCellMenuFooterComponent} from "../grid-cell-menu-footer/grid-cell-menu-footer.component";

@Component({
  selector: 'pr-grid-text-cell-menu',
  templateUrl: './grid-text-cell-menu.component.html',
  styleUrls: ['./grid-text-cell-menu.component.less'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    GridCellMenuFooterComponent
  ]
})
export class GridTextCellMenuComponent {
  @Input() label: string;
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  value: string | null = null

  onInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
  }

  onClear() {
    this.value = null;
  }
}
