import fs from "fs";
import ora from "ora";
import {CURRENT_WORKING_DIR, getContestProblemsIndices, getTestCases} from "../helpers/scraper-utils.js";
import {SEPARATOR} from "../helpers/judge-utils.js";

let CODE_TEMPLATE;

export const generate = async function (cmd) {

    try {
        CODE_TEMPLATE = fs.readFileSync(`${CURRENT_WORKING_DIR}/${cmd.template}`, 'utf8');
    } catch (e) {
        CODE_TEMPLATE = "";
    }

    if (cmd.contest) {
        try {
            await generateContestFiles(cmd.contest);
        } catch (e) {
            console.error(e);
        }
        return;
    }

    if (cmd.problem) {
        try {
            await generateProblemFiles(cmd.problem);
        } catch (e) {
            console.error(e);
        }
        return;
    }

    const inputFile = `${CURRENT_WORKING_DIR}/in.txt`;
    const outputFile = `${CURRENT_WORKING_DIR}/out.txt`;
    const codeFile = `${CURRENT_WORKING_DIR}/main.cpp`;

    const spinner = ora('Generating files').start();

    try {
        fs.writeFileSync(inputFile, '');
        fs.writeFileSync(outputFile, '');
        fs.writeFileSync(codeFile, '');
        spinner.succeed(' Successfully generated files');
    } catch (e) {
        spinner.fail(' Failed to generate files');
        console.log(e);
    }
}

const generateContestFiles = async function (contestId) {
    const spinner = ora(`Generating files for contest # ${contestId}`).start();

    try {
        const problemIndices = await getContestProblemsIndices(contestId);
        spinner.stop();
        for (const index of problemIndices) {
            await generateProblemFiles(`${contestId}${index}`);
        }
    } catch (e) {
        spinner.fail(`Failed to generate files for contest # ${contestId}`);
        console.error(e);
    }
}

const generateProblemFiles = async function (problemId) {
    let match, contestId, problemIndex;

    match = problemId.match(/^(\d+)([A-Z]\d*)$/);
    if (!match) {
        throw new Error(`Invalid problem ID`);
    }
    contestId = match[1];
    problemIndex = match[2];

    const problemFolder = `${CURRENT_WORKING_DIR}/${problemId}`;

    const inputFile = `${problemFolder}/in.txt`;
    const outputFile = `${problemFolder}/out.txt`;
    const codeFile = `${problemFolder}/main.cpp`;

    const spinner = ora(`Generating files for problem # ${problemId}`).start();

    try {
        const testcases = await getTestCases(contestId, problemIndex);
        const inputBuffer = testcases.map((testcase) => testcase.input).join(SEPARATOR);
        const outputBuffer = testcases.map((testcase) => testcase.output).join(SEPARATOR);

        if (!fs.existsSync(problemFolder)) {
            fs.mkdirSync(problemFolder);
        }
        fs.writeFileSync(inputFile, inputBuffer);
        fs.writeFileSync(outputFile, outputBuffer);
        fs.writeFileSync(codeFile, CODE_TEMPLATE);
        spinner.succeed(`Successfully generated files for problem # ${problemId}`);
    } catch (e) {
        spinner.fail(`Failed to generate files for problem # ${problemId}`);
        console.error(e);
    }
}