# Extend Expect

Helpers for extending Jest's `expect` in a type-safe manner in Typescript.

## Rationale

Extending Jest's matchers makes for much easier testing, but convincing
Typescript that you've done so is annoying. The types you need are mostly, but
not exhaustively, defined in the type stubs but aren't available for import.

This package is mostly type manipulation.
We extract the relevant types from Jest, and package them up into a wrapper
function which calls `expect.extend()` then returns `expect`.

## Use

Recommended usage follows the pattern in
[src/test/expect.ts](src/test/expect.ts).
You need an interface which denotes the extra methods you're making available on
the object returned from `expect()`, and an object implementing the matchers
corresponding to the members of the interface.

Importantly, you don't implement the extension interface:
Jest will mangle calls made to it by test code, and call the correct underlying
matcher function.

Jest has [more documentation on writing custom
matchers](https://jestjs.io/docs/expect#expectextendmatchers).
The utility functions available on `this.util` are particularly useful for
making nice failure messages.
