import {Type} from '@angular/core';
import {BasicGridExample} from "./basic-grid-example/basic-grid-example.component";
import {BasicDarkGridExample} from "./basic-dark-grid-example/basic-dark-grid-example.component";

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
  getExample('Basic Grid Example', BasicGridExample, 'basic-grid-example'),
  getExample('Basic Dark Grid Example', BasicDarkGridExample, 'basic-dark-grid-example'),
];
