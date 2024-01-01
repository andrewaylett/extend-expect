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

import { expect as originalExpect } from 'expect';

import type {
    AsymmetricMatchers,
    AsyncExpectationResult,
    BaseExpect,
    Expect as RawExpect,
    MatcherContext,
    SyncExpectationResult,
} from 'expect';

export type {
    MatcherContext,
    SyncExpectationResult,
    AsyncExpectationResult,
} from 'expect';

/**
 * The full type of a matcher function.
 */
export type MatcherFn<
    R extends SyncExpectationResult | AsyncExpectationResult,
> = (this: MatcherContext, actual: unknown, ...expected: unknown[]) => R;

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
type MatcherFnSyncAsync<T extends ExtensionFunction> =
    ReturnType<T> extends Promise<void>
        ? AsyncExpectationResult
        : SyncExpectationResult;

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

type AsyncMatcherKeys = 'rejects' | 'resolves';

type InvertedMatcherKeys = 'not';

type Asyncify<F> = F extends (...args: infer P) => infer R
    ? (...args: P) => Promise<Awaited<R>>
    : never;

/**
 * Ensure `C` has return types that are suitable for an extension function.
 */
type Extensions<C> = {
    [k in keyof C]: C[k] extends ExtensionFunction ? C[k] : ExtensionFunction;
};

/**
 * The union of the standard matcher types and our extensions.
 */
export type ExtendedMatchers<
    Matchers extends MatchersFor<unknown>,
    Original extends RawExpect,
> = Matchers extends MatchersFor<infer Functions>
    ? Functions &
          Omit<
              ReturnType<Original>,
              InvertedMatcherKeys | AsyncMatcherKeys | keyof Matchers
          >
    : never;

/**
 * Given an object with functions in it, a variant that always returns promises.
 * Used for `resolves` and `rejects`.
 */
export type MakePromise<C> = {
    [k in keyof C]: Asyncify<C[k]>;
};

/**
 * A set of matchers and their async and inverse variants.
 */
export type Promisible<T> = {
    resolves: MakePromise<T> & {
        not: MakePromise<T>;
    };
    rejects: MakePromise<T> & {
        not: MakePromise<T>;
    };
    not: T;
} & T;

/**
 * The extended `expect`, with all original matchers as well as our extensions.
 */
export type Expect<
    Matchers extends MatchersFor<unknown>,
    Original extends RawExpect,
> = (<T = unknown>(
    actual: T,
) => Promisible<ExtendedMatchers<Matchers, Original>>) &
    BaseExpect &
    AsymmetricMatchers & { not: Omit<AsymmetricMatchers, 'any' | 'anything'> };

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
 * Jest itself exposes an `expect` typed with extra functions compared to the
 * base `expect` package.  To access these extensions, supply Jest's expect as a
 * second parameter.
 *
 * @param customMatchers An object containing the underlying match functions.
 * @return An extended expect, with the correct extended type.
 */
export function extend<Matchers extends MatchersFor<unknown>>(
    customMatchers: Matchers,
): Expect<Matchers, RawExpect>;

/**
 * Extends Jest's `expect`, then returns it with the correct extended type.
 *
 * Note that this does have side effects, you probably only want to run it once
 * and save the result to be imported by your tests.
 *
 * The first generic parameter is expected to be an interface that describes the
 * functions that will be made available on the result of calling `expect()`.
 *
 * While the underlying matchers must handle unknown types, this interface
 * should probably supply correct types so that your tests may take advantage
 * of TypeScript's checking.
 *
 * For examples of this function in action, look in `test/expect.ts`.
 *
 * Jest itself exposes an `expect` typed with extra functions compared to the
 * base `expect` package.  To access these extensions, supply Jest's expect as a
 * second parameter.
 *
 * @param customMatchers An object containing the underlying match functions.
 * @param expect An instance of `expect`, or an extension of it.
 * @return An extended expect, with the correct extended type.
 */
export function extend<
    Matchers extends MatchersFor<unknown>,
    Original extends RawExpect,
>(customMatchers: Matchers, expect: Original): Expect<Matchers, Original>;

// noinspection JSUnusedGlobalSymbols
export function extend<
    Functions extends Extensions<Functions>,
    Original extends RawExpect,
>(
    customMatchers: MatchersFor<Functions>,
    expect: RawExpect = originalExpect,
): Expect<Functions, Original> {
    expect.extend(customMatchers);
    return expect as unknown as Expect<Functions, Original>;
}
