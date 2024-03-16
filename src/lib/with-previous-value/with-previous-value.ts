import {OperatorFunction, pipe} from "rxjs";
import {map, pairwise, startWith} from "rxjs/operators";

/**
 * Operator that returns a stream containing the `current` and `previous` values.
 *
 * @returns stream containing`{current, previous}`.
 *
 * @example
 * ```ts
 * const stream$ = interval(500).pipe(
 *   scan((acc, curr) => acc + 1, 0),
 *   take(2),
 *   withPreviousValue()
 * );
 * // { previous: undefined, current: 1 }
 * // { previous: 1, current: 2 }
 * ```
 */
export function withPreviousValue<T>(): OperatorFunction<
  T,
  {
    previous?: T;
    current: T;
  }
> {
  return pipe(
    startWith(undefined),
    pairwise(),
    map(([previous, current]) => ({
      previous,
      current: current!
    }))
  );
}
