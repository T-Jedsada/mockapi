# Mockapi

Mockapi helps you create a mock api service with JSON response quickly, so you
can test your client with this fake service.

<img src="http://7xrrpg.com2.z0.glb.qiniucdn.com/mockapi%20(2).gif" alt="interface">

TODO: custom response status and headers

Warning: only tested on current Chrome.

## Features

* Create, remove, filter, delete and sort api
* Import and export the api list
* Shortcut, use `⌘ s` to save current api

## Install

Make sure you have [nodejs](https://nodejs.org) and [redis](http://redis.io/)
installed.

    git clone git@github.com:chemzqm/mockapi.git
    npm install && npm run build

## Usage

Configure your redis and server port in `config.json` if needed, run command:

```
node server.js
```

Open your browser at `http://localhost:4000` (default port)

## MIT license
Copyright (c) 2016 chemzqm@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
