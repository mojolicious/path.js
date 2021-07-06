<p align="center">
  <a href="https://mojojs.org">
    <img src="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo.png?raw=true" style="margin: 0 auto;">
  </a>
</p>

[![](https://github.com/mojolicious/path.js/workflows/test/badge.svg)](https://github.com/mojolicious/path.js/actions)
[![npm](https://img.shields.io/npm/v/@mojojs/path.svg)](https://www.npmjs.com/package/@mojojs/path)
[![Coverage Status](https://coveralls.io/repos/github/mojolicious/path.js/badge.svg)](https://coveralls.io/github/mojolicious/path.js)

A convenient little wrapper around [fs](https://nodejs.org/api/fs.html) and friends. Providing a container class for
file system paths with a friendly API for dealing with different operating systems.

```js
import Path from '@mojojs/path';

// Current working directory (portable)
const dir = new Path();

// Relative file path "test.txt" (portable)
const file = new Path('test.txt');

// Relative file path "files/test.txt" (portable, POSIX example)
const file = new Path('files', 'test.txt');

// Relative file path "files/test.txt" (not portable)
const file = new Path('files/test.txt');

// Absolute file path "/home/kraih/test.txt" (not portable)
const file = new Path('/home/kraih/test.txt');
```

Paths will be automatically split and joined with the correct separator for the current operating system.

```js
// "/home/kraih/files/test.txt" (POSIX example)
new Path('/home/kraih').child('files', 'test.txt');

// "/home/kraih/files/hello.txt" (POSIX example)
new Path('/home/kraih/files/test.txt').sibling('hello.txt');

// "test.txt" (POSIX example)
new Path('/home/kraih/test.txt').basename();

// "foo/bar" (POSIX example)
new Path('/home/kraih/test.txt').dirname();

// ".txt" (POSIX example)
new Path('/home/kraih/test.txt').extname();

// ".json" (POSIX example)
new Path('/home/kraih/files/test.txt').sibling('hello.json').extname();
```

Almost all methods will return `this` or a new instance of `Path`, depedning on what makes most sense.

```js
// Write file (async)
await new Path('/home/kraih/test.txt').writeFile('Hello World!');

// Write file (sync)
new Path('/home/kraih/test.txt').writeFileSync('Hello World!');

// Read file (async)
const content = await new Path('/home/kraih/test.txt').reafFile('utf8');

// Read file (sync)
const content = new Path('/home/kraih/test.txt').reafFileSync('utf8');
```

## Installation

All you need is Node.js 16.0.0 (or newer).

```
$ npm install @mojojs/path
```
