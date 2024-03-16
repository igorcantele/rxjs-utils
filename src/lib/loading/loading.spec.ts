import { of } from "rxjs";
import { prepare } from "./loading";
import createSpy = jasmine.createSpy;

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
