import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

type Strategies<A extends any[], T> = {
  [K in keyof T]: (...args: A) => Observable<T[K]>;
};

export class CascadeStrategies<
  A extends any[],
  T extends Record<keyof T, any>
> {
  private strategies!: Strategies<A, T>;

  /**
   * Collects a set of strategies and allows to use the given strategies in cascade.
   *
   * A strategy is defined by its name (key of the `strategyMap`) and a function that execute the strategy (value of the `strategyMap`).
   *
   * @param strategyMap maps strategy names to their respective functions.
   *
   * @example
   * ```ts
   * const test = {
   *   test: (arg1: number, arg2: string) => of(arg1),
   * };
   * const strategies = new CascadeStrategies(test);
   *
   * const res = strategies.use(["test"], 1, "a");
   * ```
   * */
  constructor(strategyMap: Strategies<A, T>) {
    this.registerStrategies(strategyMap);
  }

  private registerStrategies(strategyMap: Strategies<A, T>) {
    this.strategies = strategyMap;
  }

  /**
   * Executes the given strategies in cascade.
   *
   * If a strategy function throws an error, the following strategy is used.
   * If all given strategies throws errors, an error in the stream will be thrown.
   *
   * @param strategies array of strategies to be used.
   * @param args arguments to pass to all the strategies.
   *
   * */
  use<K extends keyof T>(strategies: K[], ...args: A): Observable<T[K]> {
    if (!strategies.length) return throwError(new Error("ALL_STRATEGIES_FAILED"));
    return this.strategies[strategies[0]](...args).pipe(
      catchError(() => {
        const remainingStrategies = strategies.slice(1);
        return this.use(remainingStrategies, ...args);
      })
    );
  }
}
