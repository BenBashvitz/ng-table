import {Component} from '@angular/core';
import {PrRow, PrTable} from "../../grid/types/table.interface";

const DATA: PrRow[] = Array.from({length: 1000}, (v, i) => ({
  id: i + 1,
}));

const NEW_DATA: PrRow[] = Array.from({length: 10}, (v, i) => ({
  id: i + 2,
}));

const columns = ['id', 'name', 'type', 'status', 'more', 'shir'] as const;
type Column = typeof columns[number];

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  table: PrTable<Column> = {
    rows: DATA,
    columnToCellMapper: {
      id: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `${+row.id}`,
      }),
      name: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `שם ישות ${row.id}`,
        onEdit: (newValue: string) => {
          console.log(newValue);
        }
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
      shir: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `עוד מידע ${row.id}`,
      })
    },
    columnGroups: [
      {
        columnDef: 'Info',
        columns: [
          {
            columnDef: 'id',
            title: 'מזהה ישות',
            isSticky: true,
          },
          {
            columnDef: 'name',
            title: 'שם',
          },
          {
            columnDef: 'type',
            title: 'טיפוס',
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
          },
          {
            columnDef: 'more',
            title: 'עוד',
          },
        ],
        title: 'סטטוסים'
      },
      {
        columnDef: 'Shir',
        columns: [
          {
            columnDef: 'shir',
            title: 'שיר',
          },
        ],
        title: 'קבוצה שיר'
      },
    ],
  }
}
