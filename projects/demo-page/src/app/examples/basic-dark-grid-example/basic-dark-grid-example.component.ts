import { Component } from '@angular/core';
import { GridStore, PrGrid, PrRow } from '@parlament/grid';

const DATA: PrRow[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `${i + 1}`,
  discriminator: 'row'
}));

const columns = ['id', 'name', 'type', 'status', 'more'] as const;
type Columns = (typeof columns)[number];

@Component({
  selector: 'app-basic-dark-grid-example',
  templateUrl: './basic-dark-grid-example.component.html',
  styleUrls: ['./basic-dark-grid-example.component.css'],
  providers: [GridStore]
})
export class BasicDarkGridExample {
  constructor(public gridStore: GridStore) {}

  table: PrGrid<Columns> = {
    rows: DATA,
    columnToCellMapper: {
      id: (row: PrRow) => ({
        discriminator: 'Text',
        cellText: `${+row.id}`
      }),
      name: (row: PrRow) => ({
        discriminator: 'Text',
        cellText: `שם ישות ${Number(row.id) % 2 === 0 ? 1 : 2}`
      }),
      type: (row: PrRow) => ({
        discriminator: 'Text',
        cellText: `טיפוס ${row.id}`
      }),
      status: (row: PrRow) => ({
        discriminator: 'Text',
        cellText: `סטטוס ישות ${row.id}`
      }),
      more: (row: PrRow) => ({
        discriminator: 'Text',
        cellText: `עוד מידע ${row.id}`
      })
    },
    columnGroups: [
      {
        columnDef: 'Info',
        columns: [
          {
            columnDef: 'id',
            title: 'מזהה ישות'
          },
          {
            columnDef: 'name',
            title: 'שם'
          },
          {
            columnDef: 'type',
            title: 'טיפוס'
          }
        ],
        title: 'נתוני ישות'
      },
      {
        columnDef: 'Statuses',
        columns: [
          {
            columnDef: 'status',
            title: 'סטטוס'
          },
          {
            columnDef: 'more',
            title: 'עוד'
          }
        ],
        title: 'סטטוסים'
      }
    ],
    maxWidthInPx: 750
  };
}
