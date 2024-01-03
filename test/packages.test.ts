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

import { mkdtemp, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { spawn } from 'node:child_process';
import os from 'node:os';

import { expect } from './expect.js';

const SUCCESSFUL_BASE: string = path.resolve('./test', 'successful');
const SUCCESSFUL: Promise<string[]> = readdir(SUCCESSFUL_BASE);
const FAILING_BASE: string = path.resolve('./test', 'failing');
const FAILING: Promise<string[]> = readdir(FAILING_BASE);

async function buildTests(
    base: string,
    cases: Promise<string[]>,
    pass: boolean,
) {
    const tests = (await cases).map(async (testcase) =>
        test(`${testcase} should ${pass ? 'pass' : 'fail'}`, async (ctx) => {
            const testCaseDirectory = path.resolve(base, testcase);
            const projectDirectory = path.resolve(
                testCaseDirectory,
                '../../..',
            );
            const buildDirectory = await mkdtemp(
                path.join(os.tmpdir(), `successful-${testcase}-`),
            );
            const testDirectory = path.resolve(buildDirectory, testcase);
            await ctx.test(`${testcase} should be a directory`, async () => {
                await expect(testCaseDirectory).isADirectory();
            });
            await ctx.test(`${testcase} should copy cleanly`, () =>
                expect(
                    spawn('cp', ['-r', testCaseDirectory, buildDirectory]),
                ).toSpawnSuccessfully(),
            );
            await ctx.test(
                `${testcase} should link package under test cleanly`,
                () => {
                    return expect(
                        spawn(
                            'npm',
                            [
                                'install',
                                `file:${projectDirectory}`,
                                '--save-dev',
                            ],
                            {
                                cwd: testDirectory,
                                stdio: 'pipe',
                            },
                        ),
                    ).toSpawnSuccessfully();
                },
            );
            await ctx.test(`${testcase} should install cleanly`, () =>
                expect(
                    spawn('npm', ['install', '--install-links'], {
                        cwd: testDirectory,
                        stdio: 'pipe',
                    }),
                ).toSpawnSuccessfully(),
            );
            await ctx.test(
                `${testcase} should run tsc ${
                    pass
                        ? 'successfully'
                        : 'and exit with a non-zero status code'
                }`,
                async () => {
                    const childProcess = spawn(
                        'npx',
                        ['tsc', '-b', testDirectory],
                        {
                            cwd: projectDirectory,
                            stdio: 'pipe',
                        },
                    );

                    const allData: string[] = [];
                    childProcess.stdout.on('data', (data: string) =>
                        allData.push(data),
                    );
                    childProcess.stdout.pipe(process.stdout);
                    childProcess.stderr.pipe(process.stderr);

                    await expect(childProcess).toSpawnSuccessfully(pass);

                    const blob = allData.join('');

                    const { assert } = (await import(
                        path.resolve(testCaseDirectory, 'expect.cjs')
                    )) as {
                        assert: (output: string, e: typeof expect) => void;
                    };
                    assert(blob, expect);
                },
            );
        }),
    );
    await Promise.all(tests);
}

await buildTests(SUCCESSFUL_BASE, SUCCESSFUL, true);
await buildTests(FAILING_BASE, FAILING, false);
