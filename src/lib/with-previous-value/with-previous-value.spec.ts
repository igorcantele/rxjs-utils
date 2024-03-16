import { Subject, Subscription } from "rxjs";
import { prepare } from "../loading/loading";
import { scan } from "rxjs/operators";
import { withPreviousValue } from "./with-previous-value";

describe("prepare", () => {
  const subscriptions: Subscription[] = [];

  afterEach(() => {
    subscriptions.forEach(sub => sub.unsubscribe());
  });

  it("should invoke callback upon subscription", () => {
    const subject = new Subject<void>();
    const observable = subject.pipe(
      scan((acc, _) => acc + 1, 0),
      withPreviousValue()
    );

    let expectedValue: { current: number; previous: number | undefined };
    const subscription = observable.subscribe(value => {
      expect(value).toEqual(expectedValue);
    }, fail);

    expectedValue = { previous: undefined, current: 1 };
    subject.next();
    expectedValue = { previous: 1, current: 2 };
    subject.next();

    subscriptions.push(subscription);
  });
});
