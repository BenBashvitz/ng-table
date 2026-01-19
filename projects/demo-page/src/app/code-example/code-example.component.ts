import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Example } from '../examples';
import { StackblitzService } from '../services';
import { Observable, forkJoin } from 'rxjs';
import { tap, catchError, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-code-example',
  templateUrl: './code-example.component.html',
  styleUrls: ['./code-example.component.scss']
})
export class CodeExampleComponent implements OnInit {
  @Input() title!: string;
  @Input() example!: Example;
  @ViewChild('container', { read: ViewContainerRef, static: true })

  container!: ViewContainerRef;
  exampleSnippets = [
    { label: 'HTML', type: 'html' },
    { label: 'TS', type: 'ts' },
    { label: 'CSS', type: 'css' }
  ] as const;
  private sourceSnapshot?: { ts: string; html: string; css: string };

  source$?: Observable<{ ts: string; html: string; css: string }>;

  constructor(
    private snackbar: MatSnackBar,
    private clipboard: Clipboard,
    private stackblitzService: StackblitzService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.container.createComponent(this.example.component);
  }

  loadSourceIfNeeded(): void {
    if (this.source$) return;

    this.source$ = forkJoin({
      ts: this.http.get(this.example.tsUrl, { responseType: 'text' }),
      html: this.http.get(this.example.htmlUrl, { responseType: 'text' }),
      css: this.http.get(this.example.cssUrl, { responseType: 'text' })
    }).pipe(
      tap((source) => (this.sourceSnapshot = source)),
      catchError(() => {
        this.snackbar.open('Failed to load example source', '', { duration: 2500 });
        return [];
      }),
      shareReplay(1)
    );
  }

  copySource(text?: string) {
    if (!text) {
      this.snackbar.open('Source not loaded yet', '', { duration: 2000 });
      return;
    }

    if (this.clipboard.copy(text)) {
      this.snackbar.open('Code copied', '', { duration: 2500 });
    } else {
      this.snackbar.open('Copy failed. Please try again!', '', { duration: 2500 });
    }
  }

  copySnippet(type: 'ts' | 'html' | 'css') {
    this.copySource(this.sourceSnapshot?.[type]);
  }

  openStackblitz() {
    this.stackblitzService.open(this.example);
  }
}
