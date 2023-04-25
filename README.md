# reqbox-downstream
Downstream client providing forwarding from ReqBox to your localhost for easy testing!

[RequestBox](http://reqbox.xyz/ "RequestBox") is the fastest way to capture webhook API requests.

## Installation
```bash
$ npm install -g reqbox-downstream 
```

## CLI usage
When reqbox-downstream is installed globally, just use the `reqbox` command to start the tunnel.
```bash
$ reqbox --host localhost --port 3000 --id cm3ss10kqwzwou9gagpq
```

### Arguments
Below are some common arguments. See `reqbox --help` for additional arguments.
- `--port` Internal HTTP server port
- `--host` Downstream server providing forwarding to your localhost
- `--id` ReqBox Domain Id