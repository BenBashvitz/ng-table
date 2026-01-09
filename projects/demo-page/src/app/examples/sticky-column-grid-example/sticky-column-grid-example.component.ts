import {Component} from '@angular/core';
import {PrRow, PrGrid} from "../../grid/types/grid.interface";

const DATA: PrRow[] = Array.from({length: 1000}, (v, i) => ({
  id: i + 1,
}));

const columns = ['id', 'name', 'type', 'status', 'more'] as const;
type Columns = typeof columns[number];

@Component({
  selector: 'app-sticky-column-grid-example',
  templateUrl: './sticky-column-grid-example.component.html',
  styleUrls: ['./sticky-column-grid-example.component.css']
})
export class StickyColumnGridExample {
  table: PrGrid<Columns> = {
    rows: DATA,
    columnToCellMapper: {
      id: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `${+row.id}`,
      }),
      name: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `שם ישות ${row.id}`,
      }),
      type: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `טיפוס ${row.id}`,
      }),
      status: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `סטטוס ישות ${row.id}`,
      }),
      more: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `עוד מידע ${row.id}`,
      }),
    },
    columnGroups: [
      {
        columnDef: 'Info',
        columns: [
          {
            columnDef: 'id',
            title: 'מזהה ישות',
            isSticky: true,
            widthInPx: 150
          },
          {
            columnDef: 'name',
            title: 'שם',
            widthInPx: 250
          },
          {
            columnDef: 'type',
            title: 'טיפוס',
            widthInPx: 250
          },
        ],
        title: 'נתוני ישות'
      },
      {
        columnDef: 'Statuses',
        columns: [
          {
            columnDef: 'status',
            title: 'סטטוס',
            isSticky: true,
            widthInPx: 250
          },
          {
            columnDef: 'more',
            title: 'עוד',
            widthInPx: 350
          },
        ],
        title: 'סטטוסים'
      },
    ],
  }
}
