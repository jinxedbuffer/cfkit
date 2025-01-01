import fs from 'fs';
import ora from 'ora';
import {CACHE_DIR} from "../helpers/cache-manager.js";

export const flush = async () => {
    const spinner = ora('Flushing cache...').start();
    try {
        if (fs.existsSync(CACHE_DIR)) {
            fs.rmSync(CACHE_DIR, {recursive: true, force: true});
            spinner.succeed("Cache flushed successfully!");
        } else {
            spinner.succeed("Cache flushed successfully!");
        }
    } catch (err) {
        spinner.fail("Couldn't clear cache.");
    }
}