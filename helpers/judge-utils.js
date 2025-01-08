import {exec} from 'child_process';
import fs from 'fs/promises';
import ora from "ora";
import {CACHE_DIR} from "./cache-manager.js";
import Table from "cli-table3";

export const SEPARATOR = "---\n";

export async function compile(codePath) {
    const spinner = ora('Compiling code').start();
    try {
        await fs.mkdir(CACHE_DIR, {recursive: true});

        const executablePath = `${CACHE_DIR}/bin`;
        await new Promise((resolve, reject) => {
            exec(`g++ ${codePath} -o ${executablePath}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        spinner.succeed(' Compilation successful');
        return executablePath;
    } catch (e) {
        spinner.fail(` Compilation failed`);
        console.log(e.message);
        return null;
    }
}

export async function run(executablePath, inputPath, expectedPath, timeout = 5000) {
    const spinner = ora('Executing code').start();
    try {
        const inputFile = await fs.readFile(inputPath, 'utf8');
        const expectedFile = await fs.readFile(expectedPath, 'utf8');

        const inputCases = inputFile.split(SEPARATOR).map((s) => s.trim());
        const expectedCases = expectedFile.split(SEPARATOR).map((s) => s.trim());

        if (inputCases.length !== expectedCases.length) {
            spinner.fail("Number of input cases and expected output cases do not match");
            return;
        }

        for (let i = 0; i < inputCases.length; i++) {
            const input = inputCases[i];
            const expectedOutput = expectedCases[i];

            const startTime = performance.now();

            const actualOutput = await new Promise((resolve, reject) => {
                const process = exec(executablePath);

                let output = '';
                let error = '';
                let timeoutId;

                timeoutId = setTimeout(() => {
                    process.kill();
                }, timeout);

                process.stdin.write(input);
                process.stdin.end();

                process.stdout.on('data', (data) => {
                    output += data.toString();
                });

                process.stderr.on('data', (data) => {
                    error += data.toString();
                });

                process.on('close', (code) => {
                    clearTimeout(timeoutId);
                    if (code === 0) {
                        resolve(output.trim());
                    } else {
                        reject(error || `Process exited with code ${code}`);
                    }
                });
            });

            const endTime = performance.now();
            const executionTime = endTime - startTime;

            spinner.succeed(`Execution for testcase ${i + 1} successful (took ${executionTime.toFixed(2)} ms)`);

            if (actualOutput === expectedOutput) {
                console.log(`Testcase ${i + 1}: [+] Passed`);
            } else {
                console.log(`Testcase ${i + 1}: [x] Failed`);
                createDifferenceTable(expectedOutput, actualOutput);
            }
        }

    } catch (e) {
        spinner.fail(`Execution failed`);
        console.error(e);
    }
}

const createDifferenceTable = function (expected, got) {
    const table = new Table({
        head: [{hAlign: "center", content: 'Expected'}, {hAlign: "center", content: 'Got'}],
        wordWrap: true
    });
    table.push([expected, got]);
    console.log(table.toString());
}