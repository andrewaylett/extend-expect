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

/*
 * Copyright 2023 Andrew Aylett
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

import { test } from 'node:test';

import { extend } from 'extend-expect';
import { AsyncExpectationResult, SyncExpectationResult } from 'expect';

import type { MatchersFor, MatcherContext } from 'extend-expect';

export interface DummyMatchers {
    isAnAsyncBoolean(expected: boolean): Promise<void>;
    isASyncBoolean(expected: boolean): void;
}

async function isAnAsyncBoolean(
    this: MatcherContext,
    received: unknown,
    expected: unknown,
): AsyncExpectationResult {
    await Promise.resolve();
    if (typeof received !== 'boolean') {
        return {
            pass: false,
            message: () => 'expected to receive a boolean',
        };
    }

    if (typeof expected !== 'boolean') {
        return {
            pass: false,
            message: () => 'expected a boolean to be expected',
        };
    }

    return Promise.resolve({
        pass: expected === received,
        message: () => 'Both booleans',
    });
}

function isASyncBoolean(
    this: MatcherContext,
    received: unknown,
    expected: unknown,
): SyncExpectationResult {
    if (typeof received !== 'boolean') {
        return {
            pass: false,
            message: () => 'expected to receive a boolean',
        };
    }

    if (typeof expected !== 'boolean') {
        return {
            pass: false,
            message: () => 'expected a boolean to be expected',
        };
    }

    return {
        pass: expected === received,
        message: () => 'Both booleans',
    };
}

// noinspection JSUnusedGlobalSymbols
export const dummyMatchers: MatchersFor<DummyMatchers> = {
    isAnAsyncBoolean,
    isASyncBoolean,
};

test('Builds an extension', async (ctx): Promise<void> => {
    const expect = extend(dummyMatchers);
    await ctx.test('async isAnAsyncBoolean true', async () => {
        const p = expect(Promise.resolve(true)).resolves.isAnAsyncBoolean(true);

        await expect(p).resolves.toBeFalsy();
    });
    await ctx.test('async isAnAsyncBoolean false', async () => {
        const p = expect(Promise.resolve(true)).resolves.not.isAnAsyncBoolean(
            false,
        );

        await expect(p).resolves.toBeFalsy();
    });
    await ctx.test('sync isAnAsyncBoolean true', async () => {
        const p = expect(true).isAnAsyncBoolean(true);

        await expect(p).resolves.toBeFalsy();
    });
    await ctx.test('sync isAnAsyncBoolean false', async () => {
        const p = expect(true).not.isAnAsyncBoolean(false);

        await expect(p).resolves.toBeFalsy();
    });
    await ctx.test('async isASyncBoolean true', async () => {
        const p = expect(Promise.resolve(true)).resolves.isASyncBoolean(true);

        await expect(p).resolves.toBeFalsy();
    });
    await ctx.test('async isASyncBoolean false', async () => {
        // noinspection JSVoidFunctionReturnValueUsed
        const p = expect(Promise.resolve(true)).resolves.not.isASyncBoolean(
            false,
        );

        await expect(p).resolves.toBeFalsy();
    });
    await ctx.test('sync isASyncBoolean true', () => {
        // noinspection JSVoidFunctionReturnValueUsed
        const v = expect(true).isASyncBoolean(true);

        expect(v).toBeFalsy();
    });
    await ctx.test('sync isASyncBoolean false', () => {
        // noinspection JSVoidFunctionReturnValueUsed
        const v = expect(true).not.isASyncBoolean(false);

        expect(v).toBeFalsy();
        expect.hasAssertions();
    });
});
