import { Component, OnInit } from '@angular/core';
import { GridStore, PrGrid, PrRow, PrSortDirection } from '@parlament/grid';
import { Observable } from "rxjs";

const DATA: PrRow[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  discriminator: 'row'
}));

const columns = ['id', 'name', 'type', 'status', 'more'] as const;
type Columns = (typeof columns)[number];

const asNum = (id: string | number) => Number(id);

const hash32 = (x: string | number): number => {
  const s = String(x);
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const statuses = ['חדש', 'בטיפול', 'מושהה', 'סגור'] as const; // 4
const types = ['A', 'B', 'C'] as const;

@Component({
  selector: 'app-basic-dark-grid-example',
  templateUrl: './basic-dark-grid-example.component.html',
  styleUrls: ['./basic-dark-grid-example.component.css'],
  providers: [GridStore]
})
export class BasicDarkGridExample implements OnInit {
  isGroupByEnabled = false;
  sortDirection$: Observable<PrSortDirection>;

  constructor(public gridStore: GridStore) {}

  ngOnInit() {
    this.sortDirection$ = this.gridStore.sortDirection$;
  }

  table: PrGrid<Columns> = {
    rows: DATA,
    columnToCellMapper: {
      id: (row: PrRow) => {
        const n = asNum(row.id);
        return { discriminator: 'Text', cellText: String(n) };
      },

      name: (row: PrRow) => {
        const h = hash32(row.id);
        const bucket = (h & 1) === 0 ? 1 : 2;
        return { discriminator: 'Text', cellText: `שם ישות ${bucket}` };
      },

      type: (row: PrRow) => {
        const h = hash32(row.id) ^ 0xD4;
        const t = types[h % types.length];
        return { discriminator: 'Text', cellText: `טיפוס ${t}` };
      },

      status: (row: PrRow) => {
        const h = hash32(row.id) ^ 0xC3;
        const s = statuses[h % statuses.length];
        return { discriminator: 'Text', cellText: `סטטוס ${s}` };
      },

      more: (row: PrRow) => {
        const h = hash32(row.id);
        const isEmpty = h % 11 === 0; // ~9%
        if (isEmpty) return { discriminator: 'Text', cellText: '' };

        const bucket = ['אדום', 'ירוק', 'כחול', 'צהוב', 'סגול'][h % 5];
        const numLike = ((h >>> 8) % 25) + 1;

        return {
          discriminator: 'Text',
          cellText: `עוד ${bucket} ${numLike}`
        };
      }
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

  enableGroupBy() {
    if (!this.isGroupByEnabled) {
      this.table = { ...this.table, groupByColumnIds: ['name', 'type'] };
    } else {
      this.table = { ...this.table, groupByColumnIds: [] };
    }

    this.isGroupByEnabled = !this.isGroupByEnabled;
  }

  collapseGroupBy() {
    this.gridStore.collapseExpandAllGroups(false);
  }

  expandGroupBy() {
    this.gridStore.collapseExpandAllGroups(true);
  }

  toggleSortDirection() {
    this.gridStore.toggleSortByDirection();
    this.gridStore.sortRows();
  }

  resetSortBy() {
    this.gridStore.resetSortBy();
  }
}
