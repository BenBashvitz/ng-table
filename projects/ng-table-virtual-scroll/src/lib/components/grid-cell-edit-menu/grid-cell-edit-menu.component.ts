import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'tvs-grid-cell-edit-menu',
  templateUrl: './grid-cell-edit-menu.component.html',
  styleUrls: ['./grid-cell-edit-menu.component.less'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule
  ]
})
export class GridCellEditMenuComponent {
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
