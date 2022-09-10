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
[src/test/expect.ts](test/expect.ts).
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

## Releasing

We use `npm versions` and GitHub Actions to release.

On your local machine, with `main` checked out,
run `npm version patch` or whatever bump is appropriate.
This will create a new commit and a tag starting with `v` containing the
version.
Push the tag to GitHub.
We protect tags starting with `v`, so this step may only be undertaken by
repository administrators.

In the GitHub UI, wait until the tag has finished its CI build.
Now we may push the `main` branch without hitting branch protections.
Do so.

Again in the GitHub UI, find the tag.
Use the three dot menu on the tag to create a release.
Use the auto-fill button to populate the release notes, and publish the release.

GitHub Actions will now build the release and publish it to NPM.
