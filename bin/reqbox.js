#!/usr/bin/env node

const openurl = require('openurl');
const yargs = require('yargs');

const reqbox = require('../index');
const { version } = require('../package');

const { argv } = yargs
  .usage('Usage: reqbox --port [num] <options>')
  .option('port', {
    alias: 'p',
    describe: 'Internal HTTP server port',
    type: 'number'
  })
  .option('host', {
    alias: 'h',
    describe: 'Downstream server providing forwarding to your localhost',
    default: '127.0.0.1'
  })
  .option('protocol', {
    alias: 's',
    describe: 'Protocol (http | https)',
    default: 'http',
  })
  .option('id', {
    alias: 'd',
    describe: 'Domain ID'
  })
  .options('open', {
    alias: 'o',
    describe: 'Opens the server URL in your browser',
  })
  .option('print-requests', {
    describe: 'Print basic request info',
    default: true,
    type: 'boolean'
  })
  .demandOption('port')
  .demandOption('id')
  .help('help', 'Show this help and exit')
  .version(version);

if (typeof parseInt(argv.port, 10) !== 'number') {
  yargs.showHelp();
  console.error('\nInvalid argument: `port` must be a number');
  process.exit(1);
}

function clear(isSoft) {
  process.stdout.write(
    isSoft ? '\x1B[H\x1B[2J' : '\x1B[2J\x1B[3J\x1B[H\x1Bc'
  );
}

(async () => {
  let server;
  try {
    server = await reqbox({
      port: argv.port,
      host: argv.host,
      domain_id: argv.id,
      protocol: argv.protocol,
      printRequest: argv['print-requests']
    });
  } catch (error) {
    console.error('\nProcess failed:', error.statusCode || error.error.code);
    process.exit(0);
  }

  server.on('error', () => {
    process.exit(1);
  });

  server.on('close', () => {
    process.exit(0);
  });

  server.on('connected', () => {
    clear(true);
    process.stdin.resume();
  });

  if (argv.open) {
    openurl.open(server.url);
  }
})();
