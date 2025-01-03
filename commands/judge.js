import {compare, compile, run} from "../helpers/judge-utils.js";

export const judge = async function (cmd) {
    const currentDir = process.cwd();
    const inputFile = `${currentDir}/${cmd.input}`;
    const outputFile = `${currentDir}/${cmd.output}`;
    const codeFile = `${currentDir}/${cmd.code}`;

    const executable = await compile(codeFile);
    if (executable) {
        const actualOutput = await run(executable, inputFile);
        if (actualOutput) {
            await compare(actualOutput, outputFile)
        }
    }
}