/** @type {import('../../types.d.ts').assert} */
const assert = (blob, expect) => {
    expect(blob).toMatch('jest.ts(33,11): error TS2339');
    expect(blob).not.toMatch(/error TS(?!2339)\d+/);
    expect(blob).not.toMatch(/jest.ts\((?!33)\d+,\d+\)/);
    expect(blob).not.toMatch(/jest.ts\(\d+,(!?11)\d+\)/);
    expect(blob).not.toMatch('31');
    expect(blob).not.toMatch('35');
};

// eslint-disable-next-line no-undef
module.exports = { assert };
