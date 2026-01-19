import {CdkVirtualScrollViewport, VirtualScrollStrategy} from "@angular/cdk/scrolling";
import {Subject} from "rxjs";

export class GridVirtualScrollStrategy implements VirtualScrollStrategy {
  public viewport!: CdkVirtualScrollViewport;
  private readonly scrolledIndexChangeSubject = new Subject<number>();

  scrolledIndexChange = this.scrolledIndexChangeSubject.asObservable();
  stickyChange = new Subject<number>();

  constructor(
    public readonly itemSize: number,
    public readonly bufferPx: number,
  ) {
  }

  attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  detach(): void {
    this.scrolledIndexChangeSubject.complete();
  }

  onContentScrolled(): void {
    this.updateRenderedRange();
  }

  onDataLengthChanged(): void {
    this.updateTotalContentSize();
    this.updateRenderedRange();
  }

  onContentRendered(): void {
  }

  onRenderedOffsetChanged(): void {
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    this.viewport.scrollToOffset(index * this.itemSize, behavior);
  }

  private updateTotalContentSize() {
    const dataLength = this.viewport.getDataLength();
    this.viewport.setTotalContentSize(dataLength * this.itemSize);
  }

  private updateRenderedRange() {
    if (!this.viewport || !this.itemSize) {
      return;
    }

    const renderedOffset = this.viewport.getOffsetToRenderedContentStart();
    const start = renderedOffset / this.itemSize;
    const itemsDisplayedCount = Math.ceil(this.viewport.getViewportSize() / this.itemSize);
    const bufferItemsCount = Math.ceil(this.bufferPx / this.itemSize);
    const itemsToRenderCount = itemsDisplayedCount + 2 * bufferItemsCount;
    const end = start + itemsToRenderCount;

    const bufferOffset = renderedOffset + bufferItemsCount * this.itemSize;
    const scrollOffset = this.viewport.measureScrollOffset();

    // How far the scroll offset is from the lower buffer, which is usually where items start being displayed
    const relativeScrollOffset = scrollOffset - bufferOffset;
    const rowsScrolled = relativeScrollOffset / this.itemSize;

    const rowsToMove = Math.sign(rowsScrolled) * Math.floor(Math.abs(rowsScrolled));
    const adjustedRenderedOffset = Math.max(0, renderedOffset + rowsToMove * this.itemSize);

    // If row was not fully scrolled, or we are at the start of the table (buffer isn't full) keep the same start and end
    if (Math.abs(rowsScrolled) < 1.0 || renderedOffset === 0 && rowsScrolled < 0) {
      this.viewport.setRenderedContentOffset(renderedOffset);
      this.viewport.setRenderedRange({start, end});
    } else {
      this.viewport.setRenderedContentOffset(adjustedRenderedOffset);

      const adjustedStart = Math.max(0, start + rowsToMove);
      const adjustedEnd = adjustedStart + itemsToRenderCount;
      this.viewport.setRenderedRange({start: adjustedStart, end: adjustedEnd});
    }

    this.stickyChange.next(adjustedRenderedOffset)
  }
}
