import {Injectable} from "@angular/core";
import {
  columnDefaults,
  PrColumn,
  PrColumnGroup,
  PrRow,
  PrGrid,
  gridDefaults,
  isFreeTextCell,
  isOptionsCell,
  isComponentCell,
  PrDisplayableRow,
  PrRowGroup,
  ColumnResize,
  isGroupByRow,
  isRowArray,
  isRowGroup,
  PrSortDirection,
  PrTextCell
} from '../types/grid.interface';
import {moveItemInArray} from "@angular/cdk/drag-drop";

@Injectable({
  providedIn: 'root'
})
export class GridService {
  initializeGrid(table: PrGrid) {
    return this.divideColumnGroups(this.setGridColumnDefaultValues(this.setGridDefaultValues(table)));
  }

  changeColumnGroupOrder(table: PrGrid, columnGroup: PrColumnGroup, previousIndex: number, currentIndex: number) {
    const actualPreviousIndex = table.columnGroups.indexOf(columnGroup);
    const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
    moveItemInArray(table.columnGroups, actualPreviousIndex, actualCurrentIndex);

    return table;
  }

  changeColumnOrder(table: PrGrid, column: PrColumn, previousIndex: number, currentIndex: number) {
    const columnGroup = table.columnGroups.find(({columns}) => columns.includes(column));

    if (columnGroup) {
      const actualPreviousIndex = columnGroup.columns.indexOf(column);
      const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
      moveItemInArray(columnGroup.columns, actualPreviousIndex, actualCurrentIndex);
    }

    return table;
  }

  changeRowOrder(table: PrGrid, row: PrRow, previousIndex: number, currentIndex: number) {
    const actualPreviousIndex = table.rows.indexOf(row);
    const actualCurrentIndex = actualPreviousIndex + (currentIndex - previousIndex);
    moveItemInArray(table.rows, actualPreviousIndex, actualCurrentIndex);

    return table;
  }

  setColumnWidth(grid: PrGrid, {columnDef, newWidthInPx}: ColumnResize) {
    return {
      ...grid,
      columnGroups: grid.columnGroups.map((columnGroup) => ({
        ...columnGroup,
        columns: columnGroup.columns.map((column) => ({
          ...column,
          widthInPx: column.columnDef === columnDef ? newWidthInPx : column.widthInPx
        }))
      }))
    };
  }

  removeColumn(grid: PrGrid, column: PrColumn) {
    return {
      ...grid,
      columnGroups: grid.columnGroups.map((group) => ({
        ...group,
        columns: group.columns.filter(({columnDef}) => column.columnDef !== columnDef),
      }))
    }
  }

  removeColumnGroup(grid: PrGrid, columnGroup: PrColumn) {
    return {
      ...grid,
      columnGroups: grid.columnGroups.filter(({columnDef}) => columnGroup.columnDef !== columnDef)
    }
  }

  getAllRows(grid: PrGrid, sortByDirection: PrSortDirection): PrDisplayableRow[] {
    const groupedRows: PrDisplayableRow[] = grid.groupByColumnIds?.length
      ? this.flattenGroupedData(this.recursiveGroupBy(grid.rows, grid.groupByColumnIds, 0, grid), 0)
      : grid.rows;

    return grid.sortByColumnIds?.length
      ? this.sortRows(groupedRows, grid.sortByColumnIds, sortByDirection, grid.columnToCellMapper)
      : groupedRows;
  }

  private recursiveGroupBy(
    rows: PrRow[],
    groupByColumnIds: string[],
    level: number,
    grid: PrGrid
  ): PrRowGroup[] | PrRow[] {
    if (level >= groupByColumnIds.length) {
      return rows;
    }

    const columnId = groupByColumnIds[level];
    const groups = new Map<string, PrRow[]>();

    for (const row of rows) {
      const cell = grid.columnToCellMapper[columnId](row);
      const key = isFreeTextCell(cell) || isOptionsCell(cell) ? cell.cellText : isComponentCell(cell) ? String(cell.value()) : '';

      const rowBucket = groups.get(key);
      rowBucket ? rowBucket.push(row) : groups.set(key, [row]);
    }

    return Array.from(groups.entries(), ([groupName, groupRows]) => {
      const children = this.recursiveGroupBy(groupRows, groupByColumnIds,level + 1, grid);

      let leafCount = 0;
      let subtreeSize = 0;

      if (isRowArray(children)) {
        leafCount = children.length;
        subtreeSize = children.length;
      } else {
        for (const group of children) {
          leafCount += group.leafCount;
          subtreeSize += 1 + group.subtreeSize;
        }
      }

      return { groupName, groupColumnId: columnId, children, leafCount, subtreeSize };
    });
  }

  private flattenGroupedData(
    groupedData: PrRowGroup[] | PrRow[],
    level: number,
    result: PrDisplayableRow[] = []
  ): PrDisplayableRow[] {
    for (const item of groupedData) {
      if (!isRowGroup(item)) {
        result.push(item);
        continue;
      }

      result.push({
        groupName: item.groupName,
        id: `group_by_${item.groupColumnId}_${item.groupName}`,
        columnDef: item.groupColumnId,
        discriminator: 'groupByRow',
        leafCount: item.leafCount,
        subtreeSize: item.subtreeSize,
        isOpen: true,
      });

      const children = item.children;

      if (Array.isArray(children)) {
        if (isRowArray(children)) {
          result.push(...children);
        } else {
          this.flattenGroupedData(children, level + 1, result);
        }
      }
    }

    return result;
  }

  getDisplayedRows(rows: PrDisplayableRow[]): PrDisplayableRow[] {
    const result: PrDisplayableRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      result.push(row);

      if (isGroupByRow(row) && !row.isOpen) {
        i += row.subtreeSize;
      }
    }

    return result;
  }

  collapseExpandAllGroups(rows: PrDisplayableRow[], isExpand: boolean): PrDisplayableRow[] {
    if (!isGroupByRow(rows[0])) return rows;

    const result: PrDisplayableRow[] = [];

    for (const row of rows) {
      if (isGroupByRow(row)) {
        result.push({ ...row, isOpen: isExpand });
      } else {
        result.push(row);
      }
    }

    return result;
  }

  private setGridDefaultValues(table: PrGrid): PrGrid {
    return {
      ...gridDefaults,
      ...table
    }
  }

  private divideColumnGroups(table: PrGrid): PrGrid {
    let dividedColumnGroups: PrColumnGroup[] = []

    table.columnGroups.forEach(columnGroup => {
      let dividedGroup: PrColumnGroup[] = []

      columnGroup.columns
        .forEach((column, index) => {
          if (!column.isSticky) {
            if (dividedGroup.length === 0 || dividedGroup[dividedGroup.length - 1].isSticky) {
              dividedGroup = [...dividedGroup, {
                columnDef: columnGroup.columnDef + `__${index}`,
                title: columnGroup.title,
                columns: [column],
                isSticky: false
              }]
            } else {
              dividedGroup[dividedGroup.length - 1].columns.push(column);
              dividedGroup[dividedGroup.length - 1].columnDef = dividedGroup[dividedGroup.length - 1].columnDef + `__${index}`
            }
          } else {
            dividedGroup = [...dividedGroup, {
              columnDef: columnGroup.columnDef + `-${index}`,
              title: columnGroup.title,
              columns: [column],
              isSticky: true
            }]
          }
        })

      if (dividedGroup[dividedGroup.length - 1].columns.length === 0) dividedGroup.pop()

      dividedColumnGroups = [...dividedColumnGroups, ...dividedGroup]
    })

    table.columnGroups = dividedColumnGroups;

    return table
  }

  private setGridColumnDefaultValues(table: PrGrid): PrGrid {
    return {
      ...table,
      columnGroups: table.columnGroups.map((columnGroup) => ({
        ...columnGroup,
        columns: columnGroup.columns.map(column => ({
          ...columnDefaults,
          ...column
        }))
      }))
    }
  }

  sortRows(
    allRows: PrDisplayableRow[],
    sortByColumnIds: string[],
    direction: PrSortDirection,
    columnToCellMapper: PrGrid['columnToCellMapper']
  ): PrDisplayableRow[] {
    // Nothing to do if 0/1 row (already sorted) or if no sort columns provided.
    if (allRows.length <= 1) return allRows;
    if (!sortByColumnIds?.length) return allRows;

    // Build a comparator that compares two leaf rows by the requested column IDs.
    // This comparator is used both in non-grouped sorting and in leaf-segment sorting.
    const comparator = this.buildMultiStringComparator(sortByColumnIds, direction, columnToCellMapper);

    // Fast path: if the first row is NOT a group header row, we treat the entire list as leaf rows.
    // We then do a stable sort (decorate -> sort -> undecorate) for predictable ordering.
    if (!isGroupByRow(allRows[0])) {
      // Decorate each row with its original index so ties can be broken by index,
      // guaranteeing stability even if JS engine sort isn't stable in some environments.
      const decoratedRows = (allRows as PrRow[]).map((row, index) => ({ row, index }));
      decoratedRows.sort((x, y) => {
        // Primary comparison uses the multi-column comparator.
        const result = comparator(x.row, y.row);
        // If equal by comparator, keep original relative order via original index.
        return result !== 0 ? result : x.index - y.index;
      });
      // Undecorate back into just rows.
      return decoratedRows.map(x => x.row);
    }

    // Grouped path: work on a shallow copy to avoid mutating the original array.
    const out = allRows.slice();

    // Iterate through the display list scanning group headers and deciding which leaf segments to sort.
    for (let i = 0; i < out.length; i++) {
      const row = out[i];

      // Only group header rows define a subtree range; leaf rows are ignored here.
      if (!isGroupByRow(row)) continue;

      // The group subtree starts immediately after the group header row.
      const subtreeStart = i + 1;

      // `row.subtreeSize` is the number of rows that belong to this group’s subtree in the display list.
      // Clamp to array length to stay safe even if subtreeSize is imperfect.
      const subtreeEndExclusive = Math.min(out.length, subtreeStart + row.subtreeSize);

      // Detect whether this group subtree contains *any* nested group header rows.
      // If it does, we do NOT sort here (we want to reach the deepest leaf-only groups first).
      let firstNestedGroupIndex = -1;
      for (let j = subtreeStart; j < subtreeEndExclusive; j++) {
        if (isGroupByRow(out[j])) {
          firstNestedGroupIndex = j;
          break;
        }
      }

      // If we found a nested group header inside this subtree,
      // skip ahead so the outer loop will process that nested group header next.
      // This ensures we sort only “leaf segments” (segments that contain only PrRow leaves).
      if (firstNestedGroupIndex !== -1) {
        i = firstNestedGroupIndex - 1;
        continue;
      }

      // No nested group headers were found in this subtree range,
      // therefore the entire subtree segment should be leaf rows (PrRow),
      // and it is safe to sort that segment without affecting grouping structure.
      this.stableSortLeafSegment(out, subtreeStart, subtreeEndExclusive, comparator);

      // Skip past the subtree we just sorted so we don’t re-process its members.
      i = subtreeEndExclusive - 1;
    }

    // Return the sorted view.
    return out;
  }

  private buildMultiStringComparator(
    sortByColumnIds: string[],
    direction: PrSortDirection,
    columnToCellMapper: PrGrid['columnToCellMapper']
  ): (a: PrRow, b: PrRow) => number {
    // Convert requested direction to a multiplier used at the end of comparisons.
    const dir = direction === 'desc' ? -1 : 1;

    // Build an array of getter functions: each getter extracts a normalized string
    // from the row for a specific sort column.
    const getters = sortByColumnIds
      .map((field) => {
        // Map column id -> accessor function. If the column id is unknown, skip it.
        const mappedField = columnToCellMapper[field];
        if (!mappedField) return undefined;

        // Normalize to a trimmed string. Missing text becomes ''.
        return (row: PrRow) => String((mappedField(row) as PrTextCell)?.cellText ?? '').trim();
      }).filter((g): g is (row: PrRow) => string => !!g);

    // If no valid getters exist (no valid columns), all rows are "equal" for sorting.
    if (getters.length === 0) return () => 0;

    // Comparator: walk getters in order, returning on first decisive difference.
    return (rowA: PrRow, rowB: PrRow) => {
      for (let i = 0; i < getters.length; i++) {
        const aValue = getters[i](rowA);
        const bValue = getters[i](rowB);

        // If equal for this key, try the next key.
        if (aValue === bValue) continue;

        // Empty values are always pushed to the end.
        const aEmpty = aValue === '';
        const bEmpty = bValue === '';
        if (aEmpty || bEmpty) {
          // If both empty (should have been caught by equality above), keep going.
          if (aEmpty && bEmpty) continue;

          // Empty goes after non-empty (returns positive if a is empty).
          return aEmpty ? 1 : -1;
        }

        // Compare strings in a human-friendly way (numeric segments + case-insensitive).
        const result = aValue.localeCompare(bValue, undefined, {
          numeric: true,
          sensitivity: 'base',
        });

        // Apply direction once we have a decisive result.
        if (result !== 0) return result * dir;
      }
      // All sort keys were equal.
      return 0;
    };
  }

  private stableSortLeafSegment(
    rows: PrDisplayableRow[],
    start: number,
    endExclusive: number,
    comparator: (a: PrRow, b: PrRow) => number
  ): void {
    const length = endExclusive - start;

    // 0/1 element segments are already sorted.
    if (length <= 1) return;

    // Decorate each row with its original index (relative to the segment) for stable tie-breaking.
    const decoratedRows = new Array<{ row: PrRow; index: number }>(length);
    for (let k = 0; k < length; k++) {
      decoratedRows[k] = { row: rows[start + k] as PrRow, index: k };
    }

    // Sort decorated entries by comparator, falling back to original segment order on ties.
    decoratedRows.sort((x, y) => {
      const v = comparator(x.row, y.row);

      return v !== 0 ? v : x.index - y.index;
    });

    // Write sorted rows back into the original array segment.
    for (let k = 0; k < length; k++) {
      rows[start + k] = decoratedRows[k].row;
    }
  }
}
