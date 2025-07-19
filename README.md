# reqbox-local-forwarding
Local forwarding client that forwards requests from ReqBox to your localhost for easy testing!

[RequestBox](http://reqbox.dev/ "RequestBox") is the fastest way to capture webhook API requests.

## Installation
```bash
$ npm install -g @reqbox/local-forwarding
```

## CLI usage
When @reqbox/local-forwarding is installed globally, just use the `reqbox` command to start the tunnel.
```bash
$ reqbox --host localhost --port 3000 --id cm3ss10kqwzwou9gagpq
```

### Arguments
Below are some common arguments. See `reqbox --help` for additional arguments.
- `--port` Internal HTTP server port
- `--host` Local server host for forwarding to your localhost
- `--id` ReqBox Domain Id