import fs from "fs";
import ora from "ora";

export const generate = function () {
    const currentDir = process.cwd();
    const inputFile = `${currentDir}/in.txt`;
    const outputFile = `${currentDir}/out.txt`;
    const codeFile = `${currentDir}/main.cpp`;

    const spinner = ora('Generating files...').start();

    try {
        fs.writeFileSync(inputFile, '');
        fs.writeFileSync(outputFile, '');
        fs.writeFileSync(codeFile, '');
        spinner.succeed('Successfully generated files.');
    } catch (err) {
        spinner.fail(`Couldn't generate files`);
        console.log(err);
    }
}