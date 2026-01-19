import {VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {AfterContentInit, Directive, forwardRef, NgZone, OnDestroy} from '@angular/core';
import {combineLatest, from, Subject} from 'rxjs';
import {delayWhen, startWith, take, takeUntil} from 'rxjs/operators';
import {GridStore} from "../store/grid.store";
import {GridVirtualScrollStrategy} from "../services/grid-virtual-scroll.strategy";
import {gridBufferInPx} from "../types/grid.constants";

export function _gridVirtualScrollDirectiveStrategyFactory(gridVirtualScrollDirective: GridVirtualScrollDirective) {
  return gridVirtualScrollDirective.scrollStrategy;
}

@Directive({
  selector: 'cdk-virtual-scroll-viewport[prGridVirtualScroll]',
  standalone: true,
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useFactory: _gridVirtualScrollDirectiveStrategyFactory,
    deps: [forwardRef(() => GridVirtualScrollDirective)]
  }]
})
export class GridVirtualScrollDirective implements AfterContentInit, OnDestroy {
  scrollStrategy: GridVirtualScrollStrategy;
  private resetStickyPositions = new Subject<void>();
  private destroyed$ = new Subject<void>();

  constructor(private zone: NgZone, gridStore: GridStore) {
    gridStore.grid$.pipe(take(1)).subscribe(grid => {
      this.scrollStrategy = new GridVirtualScrollStrategy(grid.rowHeightInPx, gridBufferInPx)
    })
  }

  ngAfterContentInit() {
    combineLatest([
      this.scrollStrategy.stickyChange,
      this.resetStickyPositions.pipe(
        startWith(void 0),
        delayWhen(() => this.getScheduleObservable()),
      )
    ])
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(([stickyOffset]) => {
        this.setStickyRows(stickyOffset);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  private setStickyRows(offset: number) {
    this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll('.grid-sticky-row')
      .forEach((el: HTMLElement, index: number) => {
        el.style.top = `${index * this.scrollStrategy.itemSize - offset}px`;
      });
  }

  private getScheduleObservable() {
    return this.zone.isStable
      ? from(Promise.resolve(undefined))
      : this.zone.onStable.pipe(take(1));
  }
}
