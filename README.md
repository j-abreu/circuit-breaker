# Circuit Breaker demo
A project to demonstrate the use of the Circuit Breaker pattern.

## Running locally
To run locally you'll need `node` and `npm`.
At the root directory, just run the `scripts/setup.sh` script and it'll install all the node packages that you'll need.
In the `circuit-breaker` root directory, run:
```sh
$ sh scripts/setup.sh
```
After that, start the server from the `circuit-breaker/server/` directory:
```sh
$ cd server
$ npm run start
```

Now, you only need to start the api-gateway from the `circuit-breaker/api-gateway` directory:
```sh
$ cd api-gateway
$ npm run start
```

At this point you should have the API Gateway running in the localhost at the port 3000.
