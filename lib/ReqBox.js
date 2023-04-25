const { EventEmitter } = require('events');
const boxen = require('boxen');
const chalk = require('chalk');
const Websocket = require('ws');
const rp = require('request-promise-native');

String.prototype.padding = function(n, c) {
  const val = this.valueOf();
  if (Math.abs(n) <= val.length) {
    return val;
  }
  const m = Math.max((Math.abs(n) - this.length) || 0, 0);
  const pad = Array(m + 1).join(String(c || ' ').charAt(0));
  return (n < 0) ? pad + val : val + pad;
};

class Client extends EventEmitter {
  constructor(opts = { protocol: 'http' }) {
    super(opts);
    this.opts = opts;
    this.closed = false;
    this.opts.host = this._transformHost(this.opts.host);
    this.localPath = `${this.opts.protocol}://${this.opts.host}:${this.opts.port}`;
    this.serverHost = 'f.reqbox.xyz';
    this.uriHost = `https://${this.serverHost}`;
    this.wsHost = `ws://${this.serverHost}/fork`;
    this.started = false;
  }

  _transformHost(host) {
    host = host.split(':');
    return host[0];
  }

  async _init(cb) {
    try {
      const res = await rp({
        uri: `${this.uriHost}/check/${this.opts.domain_id}`,
        method: 'GET',
        resolveWithFullResponse: true,
        timeout: 10000
      });
      cb(null, JSON.parse(res.body));
    } catch (err) {
      cb(err, null);
    }
  }

  _establish(info) {
    const ws = new Websocket(`${this.wsHost}/${this.opts.domain_id}`);
    this.cluster = ws;
    this.url = info.url;

    this.cluster.on('error', function(error) {
      console.log(chalk.red(`connection error ${error.message}`));
      this.emit('error', error);
    });

    this.cluster.on('close', () => {
      console.log(chalk.redBright(`connection closed`));
      this.emit('close');
    })

    let firstPrintLog = true;
    
    this.cluster.on('open', () => {
      this.started = true;
      this.emit('connected', info.url);

      const boxenOptions = {
        title: 'URL',
        titleAlignment: 'center',
        padding: 1,
        margin: { bottom: 1, top: 1 },
        borderStyle: "round",
        borderColor: "green",
        backgroundColor: "#555555"
      };
      const urlBox = boxen(chalk.greenBright(`URL: ${info.url}`), boxenOptions);
      
      console.log(chalk.green       ('Session'.padding(30), 'online'));
      console.log(chalk.white       ('Version'.padding(30), info.version));
      console.log(chalk.white       ('Downstream'.padding(30), this.localPath));
      console.log(chalk.white       ('Port'.padding(30), this.opts.port));
      console.log(chalk.white       ('Domain Id'.padding(30), info.data.domain_id));
      console.log(chalk.cyanBright  ('Forwadding'.padding(30), `${info.url} -> ${this.localPath}`));
      console.log(urlBox);
    });
        
    this.cluster.on('message', async (data) => {
      if (this.opts.printRequest) {
        if (firstPrintLog) {
          console.log(`HTTP Requests`);
          console.log(`-------------`);
          firstPrintLog = !firstPrintLog;
        }
      }
      const json = JSON.parse(data);
      const request = json.Request;
      const uri = `${this.localPath}${request.path}`;
      const method = request.method;
      const path = request.path;
      const contentType = request.headers['Content-Type'] || '';

      this.emit('request', request);
      try {
        delete request.headers['Content-Length'];
        const options = {
          uri,
          method,
          headers: request.headers,
          resolveWithFullResponse: true
        };

        if (contentType.startsWith('application/json')) {
          options.json = true;
          if (request.body) options.body = request.body;
        }

        if (contentType === 'application/x-www-form-urlencoded') {
          if (request.body) options.form = request.body;
        }

        if (contentType.startsWith('multipart/form-data')) {
          if (request.body) options.form = request.body;
        }

        const res = await rp(options);
        const output = `${method.padding(8)} ${path}`;
        console.log(output.padding(35), chalk.greenBright(res.statusCode));
      } catch (err) {
        const output = `${method.padding(8)} ${path}`;
        console.log(output.padding(35), chalk.redBright(err.statusCode || err.error.code));
      }
    });
  }

  open(cb) {
    this._init((err, info) => {
      if (err) return cb(err)
      this._establish(info);
      cb();
    });
  }
}

module.exports = Client;
