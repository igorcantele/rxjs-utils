import { of, Subject, throwError } from "rxjs";
import { isLoading, prepare } from "./loading";
import { switchMap } from "rxjs/operators";
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe("prepare", () => {
  it("should invoke callback upon subscription", done => {
    const spy = createSpy("callback");
    const observable = of("test").pipe(prepare(spy));
    expect(spy).not.toHaveBeenCalled();
    observable.subscribe(value => {
      expect(spy).toHaveBeenCalled();
      expect(value).toEqual("test");
      done();
    }, fail);
  });
});

describe("isLoading", () => {
  let indicator: SpyObj<Subject<boolean>>;
  let sink: Subject<string>;

  beforeEach(() => {
    indicator = createSpyObj("subject", ["next"]);
    sink = new Subject<string>();
  });
  it("should switch indication based on subscription and completion", () => {
    const observable = sink.pipe(isLoading(indicator));
    expect(indicator.next).not.toHaveBeenCalled();
    observable.subscribe(value => {
      expect(value).toEqual("test");
    }, fail);
    expect(indicator.next.calls.mostRecent().args).toEqual([true]);
    sink.next("test");
    sink.complete();
    expect(indicator.next.calls.mostRecent().args).toEqual([false]);
  });

  it("should switch indication based on observable erroring out", () => {
    const observable = sink.pipe(
      switchMap(() => throwError(new Error("error"))),
      isLoading(indicator)
    );
    expect(indicator.next).not.toHaveBeenCalled();
    observable.subscribe({
      next: fail,
      error: error => {
        expect(error.message).toEqual("error");
      }
    });
    expect(indicator.next.calls.mostRecent().args).toEqual([true]);
    sink.next("test");
    expect(indicator.next.calls.mostRecent().args).toEqual([false]);
  });
});
