import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TableSizeService {
  private _size$ = new BehaviorSubject<number>(0);
  private minSizeInPx = 0;
  size$: Observable<number> = this._size$;

  setMinSize(minSizeInPx: number) {
    this.minSizeInPx = minSizeInPx;
  }

  updateSize(_: (previousSize: number) => number) {
    const newSize = _(this._size$.value)
    if(newSize > this.minSizeInPx) this._size$.next(newSize);
  }

  reset() {
    this._size$.next(0);
    this.minSizeInPx = 0;
  }
}
