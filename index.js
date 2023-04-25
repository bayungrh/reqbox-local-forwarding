const Client = require('./lib/ReqBox');

module.exports = function localtunnel(arg1, arg2) {
  const options = typeof arg1 === 'object' ? arg1 : { ...arg2, port: arg1 };
  const client = new Client(options);
  return new Promise((resolve, reject) =>
    client.open((err) => (err ? reject(err) : resolve(client)))
  );
};
