import * as Path from 'path';

import {
  Command,
  Object as ClimeObject,
  Options,
  command,
  option,
  param,
} from 'clime';

import * as Chalk from 'chalk';
import * as Tmp from 'tmp';

import { print } from '../../internal-util';
import { run } from '../../util';
import { BASELINE_DIR, OUTPUT_DIR } from '../config';

export class RunOptions extends Options {
  @option({
    description: 'A minimatch string to filter test cases by their IDs',
    flag: 'f',
  })
  filter: string | undefined;
}

@command({
  description: 'Run baseman tests',
})
export default class extends Command {
  async execute(
    @param({
      description: 'The directory that contains tests',
      default: 'test/baseman',
    })
    dir: ClimeObject.Directory,

    options: RunOptions,
  ) {
    await dir.assert();

    await run(dir.fullName, {
      pattern: '*-test.js',
      baselineDir: BASELINE_DIR,
      outputDir: options.filter ? Tmp.dirSync().name : OUTPUT_DIR,
      filter: options.filter,
    }, progress => {
      switch (progress.type) {
        case 'start-loading':
          print('Loading test cases...');
          break;
        case 'loaded':
          print(`Loaded ${progress.total} test cases.`);
          break;
        case 'filtered':
          print(`Filtered ${progress.count} test cases.`);
          break;
        case 'start-running':
          print('Start running test cases...\n');
          break;
        case 'running':
          let changed = progress.lastCaseDiff !== undefined;

          let doneStr = progress.done.toString();
          let totalStr = progress.total.toString();

          doneStr = new Array(totalStr.length - doneStr.length + 1).join(' ') + doneStr;

          if (changed) {
            print(`  ${Chalk.red(`[${doneStr}/${totalStr}] × ${progress.lastCaseId}`)}`);
            print(`\n${progress.lastCaseDiff}\n`);
          } else {
            print(`  ${Chalk.gray(`[${doneStr}/${totalStr}]`)} ${Chalk.green('√')} ${progress.lastCaseId}`);
          }

          break;
        case 'completed':
          print();
          break;
      }
    });
  }
}
