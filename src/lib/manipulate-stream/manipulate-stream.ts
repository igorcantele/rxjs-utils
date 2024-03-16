import { isObject } from "../utils/is-object";
import { Observable, of } from "rxjs";
import { scan, shareReplay, switchMap, withLatestFrom } from "rxjs/operators";

const addObj: <T>(value: T) => (state: T) => T = <T>(value: T) => (
  state: T
) => {
  if (isObject(value) && isObject(state)) return { ...state, ...value };
  throw new Error("State and value must both be objects or arraies.");
};
const addArr: <T>(value: T) => (state: T) => T = <T>(value: T) => (
  state: T
) => {
  if (Array.isArray(value) && Array.isArray(state))
    return [...state, ...value] as T;
  throw new Error("State and value must both be objects or arraies.");
};

const clear: <T>(value: T) => (state: T) => T = <T>(value: T) => (state: T) => {
  if (Array.isArray(value)) return [] as T;
  if (isObject(value)) return {} as T;
  throw new Error("State must  be object or array.");
};

export enum ManipulationStrategies {
  ADD_OBJECT = "add-object",
  ADD_ARRAY = "add-array",
  CLEAR = "clear"
}

type StrategyDescriptor = {
  fn: <T>(value: T) => (state: T) => T;
  base: any;
};

const manipulationStrategiesMap: Record<
  ManipulationStrategies,
  StrategyDescriptor
> = {
  [ManipulationStrategies.ADD_OBJECT]: { fn: addObj, base: {} },
  [ManipulationStrategies.ADD_ARRAY]: { fn: addArr, base: [] },
  [ManipulationStrategies.CLEAR]: { fn: clear, base: undefined }
};

export const manipulateStream = <T>(
  strategy: ManipulationStrategies
): ((source: Observable<T>) => Observable<T>) => {
  const strategyDescriptor = manipulationStrategiesMap[strategy];
  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      scan(
        (acc, elems) => strategyDescriptor.fn(elems)(acc),
        strategyDescriptor.base
      )
    );
};

export const applyManipulation = <T>(
  manipulation: Observable<ManipulationStrategies>,
  state: Observable<T>
): Observable<T> =>
  manipulation.pipe(
    withLatestFrom(state),
    switchMap(([strategy, state]) =>
      of(state).pipe(manipulateStream(strategy))
    ),
    shareReplay()
  );
