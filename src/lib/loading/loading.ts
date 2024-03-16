import {defer, Observable, of, Subject} from "rxjs";
import {catchError, finalize, first, map, startWith} from "rxjs/operators";

/**
 * Invokes a callback upon subscription.
 *
 * @param callback function to invoke upon subscription
 * @returns stream which will invoke callback
 */
export function prepare<T>(
  callback: () => void
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>): Observable<T> =>
    defer(() => {
      callback();
      return source;
    });
}

/**
 * Get loading status, one-liner that will automatically update your loading counter when the observable is making.
 *
 * NOTE: it has to be used observables that finishes when subscribed (e.g. inner http requests, form actions...)
 *
 * Usage example:
 * ```ts
 * loadingCount$ = new Subject<number>()
 * myObservable$.pipe(isLoading(loadingCount$)).subscribe()
 * myObservable2$.pipe(isLoading(loadingCount$)).subscribe()
 * ```
 */
export function isLoading<T>(
  indicator: Subject<boolean>
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      prepare(() => indicator.next(true)),
      finalize(() => indicator.next(false))
    );
}

/**
 * Get loading status before the first emission;
 * one-liner that will automatically update your loading indicator to true when the first value is emitted.
 *
 * Usage example:
 * ```ts
 * hasLoaded$ = beforeLoad<boolean>(myObservable$)
 * ```
 */
export function beforeLoad(obs: Observable<any>): Observable<boolean> {
  const isFilled = (elem: any) =>
    !!elem &&
    (!Array.isArray(elem) || !!elem.length) &&
    (typeof elem !== "object" || !!Object.keys(elem).length);
  return obs.pipe(
    first(elem => isFilled(elem)),
    map(() => false),
    startWith(true),
    catchError(() => of(false))
  );
}
