import {AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2} from '@angular/core';
import {TableSizeService} from "./table-size.service";
import {takeUntil, tap} from "rxjs/operators";
import {Subject, Subscription} from "rxjs";

@Directive({
  selector: '[tvsTableSize]',
  standalone: true,
})
export class TableSizeDirective implements AfterViewInit, OnDestroy {
  destroyed$ = new Subject<void>();
  subscription: Subscription;

  constructor(
    private element: ElementRef<HTMLElement>,
    private tableSizeService: TableSizeService,
    private renderer: Renderer2
  ) {
  }

  ngAfterViewInit(): void {
    const contentWrapper = this.element.nativeElement.getElementsByClassName('cdk-virtual-scroll-content-wrapper').item(0)
    const minWidthInPx = +window.getComputedStyle(contentWrapper).width.slice(0, -2)

    this.tableSizeService.setMinimumTableSize(minWidthInPx);

    this.subscription = this.tableSizeService.tableSize$.pipe(
      takeUntil(this.destroyed$),
      tap(tableSize => {
        this.renderer.setStyle(contentWrapper, 'width', `${tableSize}px`);
      })
    ).subscribe()
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.subscription.unsubscribe();
  }
}
