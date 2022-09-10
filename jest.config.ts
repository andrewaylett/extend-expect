import type { InitialOptionsTsJest } from 'ts-jest';

const options: InitialOptionsTsJest = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    injectGlobals: false,
};

// noinspection JSUnusedGlobalSymbols
export default options;
