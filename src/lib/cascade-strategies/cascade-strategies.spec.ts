import { CascadeStrategies } from "./cascade-strategies";
import {of, Subscription, throwError} from "rxjs";

describe("CascadeStrategies", () => {
  const subscriptions: Subscription[] = [];

  afterEach(() => {
    subscriptions.forEach(sub => sub.unsubscribe());
  });

  it("should succesfully use individual strategies", () => {
    const strategyMap = {
      testNumber: (arg1: number, arg2: string) => of(arg1),
      testString: (arg1: number, arg2: string) => of(arg2),
      testNull: (arg1: number, arg2: string) => of(null)
    };
    const cascadeStrategies = new CascadeStrategies(strategyMap);
    Object.keys(strategyMap).forEach((key: keyof typeof strategyMap) => {
      spyOn(strategyMap, key).and.callThrough();
    });

    const numberObservable = cascadeStrategies.use(["testNumber"], 0, "");
    const stringObservable = cascadeStrategies.use(["testString"], 0, "");
    const nullObservable = cascadeStrategies.use(["testNull"], 0, "");

    const numberSubscription = numberObservable.subscribe(value => {
      expect(strategyMap.testNumber).toHaveBeenCalled();
      expect(value).toEqual(0);
    }, fail);
    subscriptions.push(numberSubscription);
    const stringSubscription = stringObservable.subscribe(value => {
      expect(strategyMap.testString).toHaveBeenCalled();
      expect(value).toEqual("");
    }, fail);
    subscriptions.push(stringSubscription);
    const nullSubscription = nullObservable.subscribe(value => {
      expect(strategyMap.testNull).toHaveBeenCalled();
      expect(value).toEqual(null);
    }, fail);
    subscriptions.push(nullSubscription);
  });

  it("should succesfully use multiple strategies", () => {
    const strategyMap = {
      test1: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR")),
      test2: (arg1: number, arg2: string) => of(arg2),
      test3: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR")),
      test4: (arg1: number, arg2: string) => of(arg2),
      test5: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR")),
      test6: (arg1: number, arg2: string) => of(arg2)
    };
    const cascadeStrategies = new CascadeStrategies(strategyMap);
    Object.keys(strategyMap).forEach((key: keyof typeof strategyMap) => {
      spyOn(strategyMap, key).and.callThrough();
    });

    const test1Observable = cascadeStrategies.use(["test1", "test2"], 0, "");
    const test2Observable = cascadeStrategies.use(["test3", "test5", "test4"], 0, "");
    const test3Observable = cascadeStrategies.use(["test6"], 0, "");

    const test1Subscription = test1Observable.subscribe(value => {
      expect(strategyMap.test1).toHaveBeenCalled();
      expect(strategyMap.test2).toHaveBeenCalled();
      expect(value).toEqual("");
    }, fail);
    subscriptions.push(test1Subscription);
    const test2Subscription = test2Observable.subscribe(value => {
      expect(strategyMap.test3).toHaveBeenCalled();
      expect(strategyMap.test4).toHaveBeenCalled();
      expect(strategyMap.test6).toHaveBeenCalled();
      expect(value).toEqual("");
    }, fail);
    subscriptions.push(test2Subscription);
    const test3Subscription = test3Observable.subscribe(value => {
      expect(value).toEqual("");
    }, fail);
    subscriptions.push(test3Subscription);
  });

  it("should fail if all strategies fails", () => {
    const strategyMap = {
      test1: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR")),
      test2: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR")),
      test3: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR")),
      test4: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR")),
      test5: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR")),
      test6: (arg1: number, arg2: string) => throwError(new Error("TEST_ERROR"))
    };
    const cascadeStrategies = new CascadeStrategies(strategyMap);
    Object.keys(strategyMap).forEach((key: keyof typeof strategyMap) => {
      spyOn(strategyMap, key).and.callThrough();
    });

    const test1Observable = cascadeStrategies.use(["test1", "test2"], 0, "");
    const test2Observable = cascadeStrategies.use(["test3", "test5", "test4"], 0, "");
    const test3Observable = cascadeStrategies.use(["test6"], 0, "");
    const test4Observable = cascadeStrategies.use([], 0, "");

    const test1Subscription = test1Observable.subscribe(fail, error => {
      expect(strategyMap.test1).toHaveBeenCalled();
      expect(strategyMap.test2).toHaveBeenCalled();
      expect(error.message).toEqual("ALL_STRATEGIES_FAILED");
    });
    subscriptions.push(test1Subscription);
    const test2Subscription = test2Observable.subscribe(fail, error => {
      expect(strategyMap.test3).toHaveBeenCalled();
      expect(strategyMap.test4).toHaveBeenCalled();
      expect(strategyMap.test5).toHaveBeenCalled();
      expect(error.message).toEqual("ALL_STRATEGIES_FAILED");
    });
    subscriptions.push(test2Subscription);
    const test3Subscription = test3Observable.subscribe(fail, error => {
      expect(strategyMap.test6).toHaveBeenCalled();
      expect(error.message).toEqual("ALL_STRATEGIES_FAILED");
    });
    subscriptions.push(test3Subscription);
    const test4Subscription = test4Observable.subscribe(fail, error => {
      expect(error.message).toEqual("ALL_STRATEGIES_FAILED");
    });
    subscriptions.push(test4Subscription);
  });
});
