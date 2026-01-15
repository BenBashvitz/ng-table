import {Component} from '@angular/core';
import {PrRow, PrGrid, GridStore} from "@parlament/grid";

const DATA: PrRow[] = Array.from({length: 1000}, (v, i) => ({
  id: i + 1,
  discriminator: 'row'
}));

const columns = ['id', 'name', 'type', 'status', 'more'] as const;
type Columns = typeof columns[number];

@Component({
  selector: 'app-basic-grid-example',
  templateUrl: './basic-grid-example.component.html',
  styleUrls: ['./basic-grid-example.component.css'],
  providers: [GridStore]
})
export class BasicGridExample {
  isGroupByEnabled = false;

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
    ],
  }

  enableGroupBy() {
    if (!this.isGroupByEnabled) {
      this.table = { ...this.table, groupByColumnIds: ['name', 'type'] };
    } else {
      this.table = { ...this.table, groupByColumnIds: [] };
    }

    this.isGroupByEnabled = !this.isGroupByEnabled;
  }
}
