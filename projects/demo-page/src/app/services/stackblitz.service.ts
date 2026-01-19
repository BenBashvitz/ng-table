import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import stackBlitzSDK from '@stackblitz/sdk';
import { Example } from '../examples';
import { Utils } from '../utils';
import { forkJoin, map, Observable } from 'rxjs';

function trimEndSlash(url: string): string {
  if (url[url.length - 1] === '/') {
    url = url.substring(0, url.length - 1);
  }
  return url;
}

const templatePath = '/assets/stackblitz/';
const templateFiles = [
  'angular.json',
  'package.json',
  'src/index.html',
  'src/styles.scss',
  'src/polyfills.ts',
  'src/main.ts',
];
const replaceFilesPath = [
  'src/main.ts',
  'src/index.html',
];

function getFilePath(example: Example, ext: 'ts' | 'css' | 'html') {
  return `src/app/${example.name}.component.${ext}`;
}


@Injectable({
  providedIn: 'root'
})
export class StackblitzService {
  private files: { [path: string]: string } = {};

  constructor(
    private http: HttpClient,
    @Inject(APP_BASE_HREF) private baseHref: string,
  ) {
    this.setFiles();
  }

  open(example: Example): void {
    this.getFilesAsync(example).subscribe((files) => {
      stackBlitzSDK.openProject(
        {
          files,
          title: 'ng-basic-grid-example-virtual-scroll | ' + example.title,
          description: example.title,
          template: 'angular-cli',
          dependencies: {
            '@angular/cdk': '*',
            '@angular/material': '*',
            'ng-table-virtual-scroll': '*',
          },
        },
        {
          openFile: [getFilePath(example, 'ts'), getFilePath(example, 'html')],
        }
      );
    });
  }

  private setFiles(): void {
    templateFiles
      .forEach(fileUrl => {
        this.http.get(trimEndSlash(this.baseHref) + templatePath + fileUrl, { responseType: 'text' })
          .subscribe(content => {
            this.files[fileUrl] = content;
          });
      });
  }

  private getFilesAsync(example: Example): Observable<{ [path: string]: string }> {
    const exampleSource$ = forkJoin({
      ts: this.http.get(example.tsUrl, { responseType: 'text' }),
      html: this.http.get(example.htmlUrl, { responseType: 'text' }),
      css: this.http.get(example.cssUrl, { responseType: 'text' }),
    });

    return exampleSource$.pipe(
      map(({ ts, html, css }) => {
        const exampleFiles: { [path: string]: string } = {
          [getFilePath(example, 'ts')]: ts,
          [getFilePath(example, 'html')]: html,
          [getFilePath(example, 'css')]: css,
        };

        const replacedFiles = replaceFilesPath.reduce((files, path) => {
          files[path] = Utils.replace(this.files[path] ?? '', {
            exampleComponentName: Utils.capitalize(Utils.toCamelCase(example.name)) + 'Component',
            exampleName: example.name,
            title: example.title,
          });
          return files;
        }, {} as { [path: string]: string });

        return {
          ...this.files,
          ...exampleFiles,
          ...replacedFiles,
        };
      })
    );
  }
}
