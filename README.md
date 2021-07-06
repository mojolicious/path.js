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

// Current file (portable)
const file = Path.currentFile();

// Caller file (portable)
const file = Path.callerFile();
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

// "file:///home/kraih/test.txt" (POSIX example)
new Path('/home/kraih/test.txt').toFileURL().toString();

// "['files', 'test.txt']" (POSIX example)
new Path('files/test.txt').toArray();

// Caller directory
Path.callerFile().dirname();
```

Almost all methods will return `this` or a new instance of `Path`, depending on what makes most sense.

```js
// Write file (async)
await new Path('/home/kraih/test.txt').writeFile('Hello World!');

// Write file (sync)
new Path('/home/kraih/test.txt').writeFileSync('Hello World!');

// Read file (async)
const content = await new Path('/home/kraih/test.txt').readFile('utf8');

// Read file (sync)
const content = new Path('/home/kraih/test.txt').readFileSync('utf8');

// Create file or update utime (async)
await new Path('/home/kraih/test.txt').touch();

// Create file or update utime (sync)
new Path('/home/kraih/test.txt').touchSync();

// Open file (async)
const fh = await new Path('/home/kraih').child('test.txt').open('w');
await fh.write('Hello ');
await fh.write('JavaScript!');
await fh.close();

// Create writable stream
const writable = new Path('test.txt').createWriteStream({encoding: 'utf8'});

// Create readable stream
const readable = new Path('test.txt').createReadStream({encoding: 'utf8'});
```

Temporary directories will be deleted automatically when node stops, but can also be removed manually with the `destroy`
method.

```js
// Temporaty directory (async)
const dir = await Path.tempDir();
await dir.child('test.txt').touch();
await dir.destroy();

// Temporary directory (sync)
const dir = Path.tempDirSync();
dir.child('test.txt').touchSync();
dir.destroySync();
```

There is a `*Sync` alternative for almost every method returning a `Promise`.

## Installation

All you need is Node.js 16.0.0 (or newer).

```
$ npm install @mojojs/path
```
