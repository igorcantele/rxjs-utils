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
 * Indicates whether the observable is currently loading (meaning subscription is active and
 * it hasn't completed or errored).
 *
 * @param indicator subject as target for indication
 * @returns stream which will indicate loading through passed subject
 *
 * @example
 * ```ts
 * isLoading$ = new Subject<boolean>()
 * myObservable$.pipe(isLoading(isLoading$)).subscribe()
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
 * Return an observable that indicates whether the observable has emitted at least once or has errored.
 *
 * @param obs observable target for indication
 * @param filterFn function to filter eligible observable values to stop loading
 * @returns observable which will indicate loading state
 *
 * @example
 * ```ts
 * hasLoaded$ = beforeLoad<boolean>(myObservable$)
 * ```
 */
export function beforeLoad<T>(
  obs: Observable<T>,
  filterFn: (value: T) => boolean = () => true
): Observable<boolean> {
  return obs.pipe(
    first(elem => filterFn(elem)),
    map(() => false),
    startWith(true),
    catchError(() => of(false))
  );
}
