#!/usr/bin/env node

import * as Path from 'path';

import { CLI, Shim } from 'clime';

let cli = new CLI('baseman', Path.join(__dirname, 'commands'));

let shim = new Shim(cli);
shim.execute(process.argv);