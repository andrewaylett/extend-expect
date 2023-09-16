/*
 * Copyright 2022 Andrew Aylett
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect as originalExpect } from '@jest/globals';

import type {
    Expect as RawExpect,
    Matchers,
    MatcherState as OriginalMatcherState,
} from 'expect';
import type jestMatcherUtils from 'jest-matcher-utils';

export type MatcherState = OriginalMatcherState & {
    utils: typeof jestMatcherUtils;
};

/**
 * The type of the object that needs to be passed to extend Jest's expect.
 * Ideally we'd import this, but it's not public.
 */
export type CustomMatchers = Parameters<typeof originalExpect.extend>[0];

/**
 * For a union type, take any non-promise variants.
 */
type SyncVariant<T> = T extends Promise<unknown> ? never : T;

/**
 * The type to be returned by a Jest custom match function.
 * Ideally we'd import this, but it's not public.
 */
export type ExpectationResult = SyncVariant<ReturnType<CustomMatchers['fn']>>;

/**
 * The full type of a matcher function.
 */
export type MatcherFn<
    R extends ExpectationResult | Promise<ExpectationResult>,
> = (this: MatcherState, actual: unknown, ...expected: unknown[]) => R;

/**
 * When called on an expectation, in test code, a matcher should look like this
 * type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtensionFunction = (...p: any[]) => void | Promise<void>;

/**
 * Based on whether the user-callable matcher is sync or not, the internal
 * matcher should be correspondingly sync or not.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MatcherFnSyncAsync<T extends (...p: any[]) => void | Promise<void>> =
    ReturnType<T> extends Promise<void>
        ? Promise<ExpectationResult>
        : ExpectationResult;

/**
 * Given a type which defines the extensions to the object returned from
 * expect(), evaluates to the type of the object that needs to be passed to
 * expect.extend()
 */
export type MatchersFor<T> = {
    [P in keyof T]: T[P] extends ExtensionFunction
        ? MatcherFn<MatcherFnSyncAsync<T[P]>>
        : never;
};

type EnsureParameters<T> = T extends (...args: infer P) => unknown ? P : never;

/**
 * Ensure `C` has return types that are suitable for an extension function.
 */
type Extensions<C> = {
    [k in keyof C]: (...p: EnsureParameters<C[k]>) => void | Promise<void>;
};

/**
 * The union of the standard matcher types and our extensions.
 */
type ExtendedMatchers<C extends Extensions<C>> = Matchers<void> & C;

/**
 * Given an object with functions in it, a variant that always returns promises.
 * Used for `resolves` and `rejects`.
 */
type MakePromise<C> = {
    [k in keyof C]: (...p: EnsureParameters<C[k]>) => Promise<void>;
};

/**
 * The union of the standard matchers as promises, and our extensions.
 */
type PromiseMatchers<C extends Extensions<C>> = Matchers<Promise<void>> &
    MakePromise<C>;

/**
 * The type that needs to be mixed into the matchers to allow promises and
 * inversions.
 */
type ExtendedPromiseMatchers<C extends Extensions<C>> = {
    /**
     * Unwraps the reason of a rejected promise so any other matcher can be
     * chained. If the promise is fulfilled the assertion fails.
     */
    rejects: PromiseMatchers<C>;
    /**
     * Unwraps the value of a fulfilled promise so any other matcher can be
     * chained. If the promise is rejected the assertion fails.
     */
    resolves: PromiseMatchers<C>;
    /**
     * Negates the sense of the provided matcher
     */
    not: ExtendedMatchers<C> & ExtendedPromiseMatchers<C>;
};

/**
 * The extended `expect`, with all original matchers as well as our extensions.
 */
export interface Expect<F extends Extensions<F>> extends RawExpect {
    <T = unknown>(
        actual: T,
    ): ExtendedMatchers<F> & ExtendedPromiseMatchers<F> & typeof originalExpect;
}

/**
 * Extends Jest's `expect`, then returns it with the correct extended type.
 *
 * Note that this does have side effects, you probably only want to run it once
 * and save the result to be imported by your tests.
 *
 * The generic parameter is expected to be an interface that describes the
 * functions that will be made available on the result of calling `expect()`.
 *
 * While the underlying matchers must handle unknown types, this interface
 * should probably supply correct types so that your tests may take advantage
 * of TypeScript's checking.
 *
 * For examples of this function in action, look in `test/expect.ts`.
 *
 * @param {<F extends Extensions<F>>MatchersFor<F>} customMatchers An object containing the underlying match functions.
 * @return {<F extends Extensions<F>>Expect<F>} Jest's expect.
 */
export const extend = <F extends Extensions<F>>(
    customMatchers: MatchersFor<F>,
): Expect<F> => {
    originalExpect.extend(customMatchers);
    return originalExpect as unknown as Expect<F>;
};
