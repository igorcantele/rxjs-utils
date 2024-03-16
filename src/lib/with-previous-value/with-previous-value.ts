import { OperatorFunction, pipe } from "rxjs";
import { map, pairwise, startWith } from "rxjs/operators";

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
