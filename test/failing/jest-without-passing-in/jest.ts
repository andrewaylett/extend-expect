import { extend } from 'extend-expect';
import { expect as jestExpect } from '@jest/globals';

import type {
    MatchersFor,
    MatcherContext,
    AsyncExpectationResult,
} from 'extend-expect';

async function toBeAStub(
    this: MatcherContext,
    received: unknown,
    expected: unknown,
): AsyncExpectationResult {
    return {
        pass: true,
        message: () => '',
    };
}

interface DummyMatchers {
    toBeAStub(success?: boolean): Promise<void>;
}

const processMatchers: MatchersFor<DummyMatchers> = {
    toBeAStub,
};

const expect = extend(processMatchers);

jestExpect(1).toMatchInlineSnapshot('1');
// Only available in Jest's extensions
expect(1).toMatchInlineSnapshot('1');
// Locally extended
expect(2).toBeAStub(false);

export default expect;
