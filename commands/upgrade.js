import {exec} from "child_process";
import ora from "ora";

export const upgrade = function () {
    const spinner = ora('Upgrading').start();
    exec('npm install -g @jinxedbuffer/cfkit@latest', (error, stdout, stderr) => {
        if (error) {
            spinner.fail('Could not upgrade cfkit');
            console.error(error);
            return;
        }
        if (stderr) {
            spinner.fail('Could not upgrade cfkit');
            console.error(stderr);
            return;
        }
        spinner.succeed('Successfully upgraded cfkit');
        console.log(stdout);
    });
}