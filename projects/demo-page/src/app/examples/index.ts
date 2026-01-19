import {Type} from '@angular/core';
import {BasicGridExample} from "./basic-grid-example/basic-grid-example.component";
import {BasicDarkGridExample} from "./basic-dark-grid-example/basic-dark-grid-example.component";
import {EditableCellGridExample} from "./editable-cell-grid-example/editable-cell-grid-example.component";
import { GroupByGridExample } from './group-by-grid-example/group-by-grid-example.component';
import {StickyColumnGridExample} from "./sticky-column-grid-example/sticky-column-grid-example.component";
import { SortByGridExample } from './sort-by-grid-example/sort-by-grid-example.component';
import {GridRowActionsExample} from "./grid-row-actions-example/grid-row-actions-example.component";

export * from './examples.module';

export interface Example {
  component: Type<any>;
  name: string;
  title: string;
  tsUrl: string;
  htmlUrl: string;
  cssUrl: string;
}

function getExample(title: string, component: Type<any>, name: string): Example {
  const base = `assets/examples/${name}/${name}.component`;

  return {
    title,
    name,
    component,
    tsUrl: `${base}.ts`,
    htmlUrl: `${base}.html`,
    cssUrl: `${base}.css`,
  };
}

export const examples: Example[] = [
  getExample('Basic Grid Example', BasicGridExample, 'basic-grid-example'),
  getExample('Basic Dark Grid Example', BasicDarkGridExample, 'basic-dark-grid-example'),
  getExample('Editable Cell Grid Example', EditableCellGridExample, 'editable-cell-grid-example'),
  getExample('Sticky Column Grid Example', StickyColumnGridExample, 'sticky-column-grid-example'),
  getExample('Group By Grid Example', GroupByGridExample, 'group-by-grid-example'),
  getExample('Sort By Grid Example', SortByGridExample, 'sort-by-grid-example'),
  getExample('Grid Row Actions Example', GridRowActionsExample, 'grid-row-actions-example'),
];
