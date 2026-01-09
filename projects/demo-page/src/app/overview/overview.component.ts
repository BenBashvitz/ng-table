import { Component } from '@angular/core';

const snippets = {
  importComponent: `import { GridComponent } from 'pr-grid';

@NgModule({
  imports: [
    // ...
    GridComponent
  ]
})
export class MyCustomTableModule { }
`
};


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
  snippets = snippets;

  versionCompatibilityColumns = ['ng', 'lib'];
  versionCompatibility = Object.entries({
    '\>= 15': 'latest',
    '13 - 14': '1.5.*',
    '<= 12': '1.3.*'
  });
}
