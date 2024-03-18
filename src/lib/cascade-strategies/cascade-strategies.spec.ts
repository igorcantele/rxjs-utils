import { CascadeStrategies } from "./cascade-strategies";
import { of, Subscription } from "rxjs";

const ciao = {
  ciao: (arg1: number, arg2: string) => of(arg1),
  domani: (arg1: number, arg2: string) => of(arg2)
};

const strat = new CascadeStrategies(ciao);

const res = strat.use(["ciao"], 1, "f");

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
});
