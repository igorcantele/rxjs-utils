import {of, Subject, throwError} from "rxjs";
import {beforeLoad, isLoading, prepare} from "./loading";
import {bufferCount, switchMap} from "rxjs/operators";
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

    it("should switch indication based on the observable erroring out", () => {
        const observable = sink.pipe(
            switchMap(() => throwError(new Error("EXPECTED_ERROR"))),
            isLoading(indicator)
        );
        expect(indicator.next).not.toHaveBeenCalled();
        observable.subscribe({
            next: fail,
            error: error => {
                expect(error.message).toEqual("EXPECTED_ERROR");
            }
        });
        expect(indicator.next.calls.mostRecent().args).toEqual([true]);
        sink.next("test");
        expect(indicator.next.calls.mostRecent().args).toEqual([false]);
    });
});

describe("beforeLoad", () => {
    it("should switch indication based on subscription", () => {
        const eventEmitter = new Subject<number>
        const targetObservable = eventEmitter.asObservable();
        const beforeLoad$ = beforeLoad(targetObservable);

        let expectedValue = true

        beforeLoad$.subscribe({
            next: value => {
                expect(value).toEqual(expectedValue)
            },
            error: fail
        })

        expectedValue = false;
        eventEmitter.next(1);
        eventEmitter.next(1);
    });

    it("should switch indication based on subscription and the given filter function", () => {
        const eventEmitter = new Subject<number>
        const targetObservable = eventEmitter.asObservable();
        const beforeLoad$ = beforeLoad(targetObservable, (num) => num !== 1);

        let expectedValue = true

        beforeLoad$.subscribe({
            next: value => {
                expect(value).toEqual(expectedValue)
            },
            error: fail
        })

        eventEmitter.next(1);
        expectedValue = false;
        eventEmitter.next(2);
        eventEmitter.next(1);
    });

    it("should switch indication based on the observable erroring out", () => {
        const beforeLoad$ = beforeLoad(throwError(new Error("EXPECTED_ERROR")));
        beforeLoad$.pipe(bufferCount(2)).subscribe({
            next: value => {
                expect(value).toEqual([true, false])
            },
            error: fail
        })

    });
});
