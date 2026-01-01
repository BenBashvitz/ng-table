import {Component} from '@angular/core';
import {PrRow, PrTable} from "ng-table-virtual-scroll";

const DATA: PrRow[] = Array.from({length: 10000}, (v, i) => ({
  id: i + 1,
}));

const NEW_DATA: PrRow[] = Array.from({length: 10000}, (v, i) => ({
  id: i + 2,
}));

const columns = ['id', 'name', 'type', 'status', 'more'] as const;
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
        cellText: `Element #${+row.id} ${+row.id % 5 !== 0 ? '' : 'longggggg texttttttttttttt'}`,
      }),
      type: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `${+row.id}`,
      }),
      status: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `Element #${+row.id}`,
      }),
      more: (row: PrRow) => ({
        discriminator: "Text",
        cellText: `Element #${+row.id}`,
      }),
    },
    columnGroups: [
      {
        columnDef: 'category1',
        columns: [
          {
            columnDef: 'id',
            title: 'No.',
          },
          {
            columnDef: 'name',
            title: 'Name',
          },
          {
            columnDef: 'type',
            title: 'Type',
          },
        ],
        title: 'Category 1'
      },
      {
        columnDef: 'category2',
        columns: [
          {
            columnDef: 'status',
            title: 'Status',
          },
          {
            columnDef: 'more',
            title: 'More',
          },
        ],
        title: 'Category 2'
      },
    ]
  }
}
