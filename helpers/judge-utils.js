import {exec} from 'child_process';
import fs from 'fs/promises';
import ora from "ora";
import {CACHE_DIR} from "./cache-manager.js";

export async function compile(codePath) {
    const spinner = ora('Compiling code...').start();
    try {
        await fs.mkdir(CACHE_DIR, {recursive: true});

        const executablePath = `${CACHE_DIR}/exec`;
        await new Promise((resolve, reject) => {
            exec(`g++ ${codePath} -o ${executablePath}`, (error, stdout, stderr) => {
                if (error) {
                    reject(`Compilation failed: ${stderr}`);
                } else {
                    resolve();
                }
            });
        });

        spinner.succeed('Compilation successful');
        return executablePath;
    } catch (error) {
        spinner.fail(`Compilation failed: ${error}`);
        return null;
    }
}

export async function run(executablePath, inputPath) {
    const spinner = ora('Executing code...').start();
    try {
        const input = await fs.readFile(inputPath, 'utf8');

        const output = await new Promise((resolve, reject) => {
            const process = exec(executablePath);
            process.stdin.write(input);
            process.stdin.end();

            process.stdout.on('data', (data) => {
                resolve(data.toString());
            });

            process.stderr.on('data', (data) => {
                reject(`Execution failed: ${data.toString()}`);
            });
        });

        spinner.succeed('Execution successful');
        return output.trim();
    } catch (error) {
        spinner.fail(`Execution failed: ${error}`);
        return null;
    }
}

export async function compare(actualOutput, expectedFile) {
    const spinner = ora('Comparing outputs...').start();
    try {
        const expectedOutput = await fs.readFile(expectedFile, 'utf8');

        if (actualOutput === expectedOutput.trim()) {
            spinner.succeed('Test passed');
        } else {
            spinner.fail('Test failed');
            console.log(`\nExpected:\n${expectedOutput}`);
            console.log(`Got:\n${actualOutput}`);
        }
    } catch (error) {
        spinner.fail(`Error reading expected file: ${error}`);
    }
}
