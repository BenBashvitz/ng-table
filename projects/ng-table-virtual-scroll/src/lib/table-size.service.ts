import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TableSizeService {
  private _tableSize$  = new BehaviorSubject<number>(0);
  private minWidthInPx = 0
  tableSize$: Observable<number> = this._tableSize$;

  setMinimumTableSize(minWidthInPx: number) {
    this.minWidthInPx = minWidthInPx;
  }

  updateTableSize(_: (previousSize: number) => number) {
    const newSize = _(this._tableSize$.value)
    if(newSize > this.minWidthInPx) this._tableSize$.next(_(this._tableSize$.value));
  }
}
