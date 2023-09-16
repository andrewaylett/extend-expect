import type { JestConfigWithTsJest } from 'ts-jest';

const options: JestConfigWithTsJest = {
    preset: 'ts-jest',
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testEnvironment: 'node',
    injectGlobals: false,
};

// noinspection JSUnusedGlobalSymbols
export default options;
