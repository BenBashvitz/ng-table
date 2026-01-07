import {Type} from '@angular/core';
import {TableComponent} from "./table/table.component";

export * from './examples.module';

export interface Example {
  component: Type<any>;
  ts: string;
  html: string;
  css: string;
  name: string;
  title: string;
}

function getExample(title: string, component: Type<any>, name: string): Example {
  return {
    title,
    name,
    component,
    ts: require(`!!../examples/${name}/${name}.component.ts?raw`),
    html: require(`!!../examples/${name}/${name}.component.html?raw`),
    css: require(`!!../examples/${name}/${name}.component.css?raw`),
  };
}

export const examples: Example[] = [
  getExample('Table', TableComponent, 'table'),
];
