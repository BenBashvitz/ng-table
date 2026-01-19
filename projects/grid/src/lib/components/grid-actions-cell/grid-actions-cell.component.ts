import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PrActionsCell, PrGridAction, PrRow} from "../../types/grid.interface";
import {MatDividerModule} from "@angular/material/divider";
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {MatOptionModule} from "@angular/material/core";
import {MatIconModule} from "@angular/material/icon";
import {GridStore} from "@parlament/grid";
import {Observable} from "rxjs";

@Component({
  selector: 'pr-grid-actions-cell',
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatMenuModule, MatOptionModule, MatIconModule],
  templateUrl: './grid-actions-cell.component.html',
  styleUrls: ['./grid-actions-cell.component.less']
})
export class GridActionsCellComponent implements OnInit {
  @Input() cell: PrActionsCell
  @Input() row: PrRow
  @Input() columnDef: string;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  isRowPinned$: Observable<boolean>
  readonly pinRowText = 'נעיצת שורה';
  readonly unpinRowText = 'הסרת שורה מנעיצה';

  constructor(private gridStore: GridStore) {
  }

  ngOnInit(): void {
    this.isRowPinned$ = this.gridStore.isRowPinned$(this.row.id)
  }

  onPinRow() {
    this.gridStore.togglePinnedRow(this.row)
  }

  onClickOption(action: PrGridAction) {
    action.onAction()
  }
}
