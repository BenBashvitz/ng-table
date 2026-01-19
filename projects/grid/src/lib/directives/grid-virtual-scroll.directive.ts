import {VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
import {AfterContentInit, Directive, forwardRef, NgZone, OnDestroy} from '@angular/core';
import {combineLatest, from, Subject} from 'rxjs';
import {delayWhen, startWith, take, takeUntil, tap} from 'rxjs/operators';
import {GridStore} from "../store/grid.store";
import {GridVirtualScrollStrategy} from "../services/grid-virtual-scroll.strategy";

export function _tableVirtualScrollDirectiveStrategyFactory(tableDir: GridVirtualScrollDirective) {
  return tableDir.scrollStrategy;
}

function combineSelectors(...pairs: string[][]): string {
  return pairs.map((selectors) => `${selectors.join(' ')}, ${selectors.join('')}`).join(', ');
}

const stickyRowsSelector = combineSelectors(
  ['.grid-sticky-row']
);

@Directive({
  selector: 'cdk-virtual-scroll-viewport[prGridScroll]',
  standalone: true,
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useFactory: _tableVirtualScrollDirectiveStrategyFactory,
    deps: [forwardRef(() => GridVirtualScrollDirective)]
  }]
})
export class GridVirtualScrollDirective implements AfterContentInit, OnDestroy {
  scrollStrategy: GridVirtualScrollStrategy;
  private stickyPositions: Map<HTMLElement, number>;
  private resetStickyPositions = new Subject<void>();
  private destroyed$ = new Subject<void>();

  constructor(private zone: NgZone, gridStore: GridStore) {
    gridStore.grid$.pipe(take(1)).subscribe(grid => {
      this.scrollStrategy = new GridVirtualScrollStrategy(grid.rowHeightInPx, 300)
    })
  }

  ngAfterContentInit() {
    combineLatest([
      this.scrollStrategy.stickyChange,
      this.resetStickyPositions.pipe(
        startWith(void 0),
        delayWhen(() => this.getScheduleObservable()),
        tap(() => {
          this.stickyPositions = null;
        })
      )
    ])
      .pipe(
        takeUntil(this.destroyed$)
      )
      .subscribe(([stickyOffset]) => {
        if (!this.stickyPositions) {
          this.initStickyPositions();
        }
        this.setStickyRows(stickyOffset);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  private initStickyPositions() {
    this.stickyPositions = new Map<HTMLElement, number>();

    this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll(stickyRowsSelector)
      .forEach(el => {
        const parent = el.parentElement;
        if (!this.stickyPositions.has(parent)) {
          this.stickyPositions.set(parent, parent.offsetTop);
        }
      });
  }

  private setStickyRows(offset: number) {
    this.scrollStrategy.viewport.elementRef.nativeElement.querySelectorAll(stickyRowsSelector)
      .forEach((el: HTMLElement, index: number) => {
        const parent = el.parentElement;
        let baseOffset = 0;
        if (this.stickyPositions.has(parent)) {
          baseOffset = index * this.scrollStrategy.itemSize
        }

        el.style.top = `${baseOffset - offset}px`;
      });
  }

  private getScheduleObservable() {
    // Use onStable when in the context of an ongoing change detection cycle so that we
    // do not accidentally trigger additional cycles.
    return this.zone.isStable
      ? from(Promise.resolve(undefined))
      : this.zone.onStable.pipe(take(1));
  }
}
