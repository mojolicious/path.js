<p align="center">
  <a href="https://mojojs.org">
    <picture>
      <source srcset="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo-dark.png?raw=true" media="(prefers-color-scheme: dark)">
      <img src="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo.png?raw=true" style="margin: 0 auto;">
    </picture>
  </a>
</p>

[![](https://github.com/mojolicious/path.js/workflows/test/badge.svg)](https://github.com/mojolicious/path.js/actions)
[![Coverage Status](https://coveralls.io/repos/github/mojolicious/path.js/badge.svg?branch=main)](https://coveralls.io/github/mojolicious/path.js?branch=main)
[![npm](https://img.shields.io/npm/v/@mojojs/path.svg)](https://www.npmjs.com/package/@mojojs/path)

A convenient little wrapper around [fs](https://nodejs.org/api/fs.html) and friends. Providing a container class for
file system paths with a friendly API for dealing with different operating systems. Written in TypeScript.

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

// Absolute file path "/home/kraih/test.txt" from URL (not portable)
const file = Path.fromFileURL('file:///home/kraih/test.txt');

// Current file (portable)
const file = Path.currentFile();

// Caller file (portable)
const file = Path.callerFile();

// Create a temporary directory (portable and secure)
const dir = await Path.tempDir();
```

Paths will be automatically split and joined with the correct separator for the current operating system. For the
following examples we will be using POSIX paths and assume a Linux operating system.

```js
// "/home/kraih/files/test.txt"
new Path('/home/kraih').child('files', 'test.txt');

// "/home/kraih/files/hello.txt"
new Path('/home/kraih/files/test.txt').sibling('hello.txt');

// "test.txt"
new Path('/home/kraih/test.txt').basename();

// "/home/kraih"
new Path('/home/kraih/test.txt').dirname();

// ".txt"
new Path('/home/kraih/test.txt').extname();

// "/home/kraih/test.txt"
new Path('/home/kraih/files/../test.txt').normalize();

// "/home"
new Path('/home/kraih/test.txt').dirname().dirname();

// ".json"
new Path('/home/kraih/files/test.txt').sibling('hello.json').extname();

// "file:///home/kraih/test.txt"
new Path('/home/kraih/test.txt').toFileURL().toString();

// {root: "/", dir: "/home/kraih", base: "test.txt", ext: ".txt", name: "test"}
new Path('/home/kraih/test.txt').toObject();

// ['files', 'test.txt']
new Path('files/test.txt').toArray();

// Caller directory
Path.callerFile().dirname();
```

Almost all methods will return `this` or a new instance of `Path`, depending on what makes most sense.

```js
// Write file
const file = await new Path('/home/kraih/test.txt').writeFile('Hello World!');
const file = new Path('/home/kraih/test.txt').writeFileSync('Hello World!');

// Read file
const content = await new Path('/home/kraih/test.txt').readFile('utf8');
const content = new Path('/home/kraih/test.txt').readFileSync('utf8');

// Create file or update utime
const file = await new Path('/home/kraih/test.txt').touch();
const file = new Path('/home/kraih/test.txt').touchSync();

// Append to file
const file = await new Path('/home/kraih/test.txt').appendFile('Hello World!');
const file = new Path('/home/kraih/test.txt').appendFileSync('Hello World!');

// Open file (async)
const fh = await new Path('/home/kraih').child('test.txt').open('w');
await fh.write('Hello ');
await fh.write('JavaScript!');
await fh.close();

// Create writable stream
const writable = new Path('test.txt').createWriteStream({encoding: 'utf8'});

// Create readable stream
const readable = new Path('test.txt').createReadStream({encoding: 'utf8'});

// Read lines from file
for await (const line of new Path('test.txt').lines({encoding: 'utf8'})) {
 console.log(line);
}
```

There are `*Sync` alternatives for almost all methods returning a `Promise`. And `fs.constants` are available via
`Path.constants`.

```js
// Make file read-only
const file = await new Path('test.txt').chmod(Path.constants.O_RDONLY);
const file = new Path('test.txt').chmodSync(Path.constants.O_RDONLY);

// Check file access (async)
const isReadable = await new Path('test.txt').access(Path.constants.R_OK);
const isReadable = await new Path('test.txt').isReadable();
const isWritable = await new Path('test.txt').isWritable();

// Check file access (sync)
const isReadable = new Path('test.txt').accessSync(Path.constants.R_OK);
const isReadable = new Path('test.txt').isReadableSync();
const isWritable = new Path('test.txt').isWritableSync();

// Check if file exists
const exists = await new Path('test.txt').exists();
const exists = new Path('test.txt').existsSync();

// Resolve path on file system
const real = await new Path('test.txt').realpath();
const real = new Path('test.txt').realpathSync();

// Check if file is absolute
const isAbsolute = new Path('test.txt').isAbsolute();

// Change ownership of a file
const file = await new Path('test.txt').chown(1, 5);
const file = new Path('test.txt').chownSync(1, 5);
```

Working with directories is just as easy.

```js
// Create directory
const dir = await new Path('test', '123').mkdir({recursive: true});
const dir = new Path('test', '123').mkdirSync({recursive: true});

// Remove directory
await new Path('test').rm({recursive: true});
new Path('test').rmSync({recursive: true});

// List files in directory
for await (const file of new Path('test').list()) {
  console.log(file.toString());
}

// List files recursively
for await (const file of new Path('test').list({recursive: true})) {
  console.log(file.toString());
}
```

The creation of temporary directories is supported as well. They will be deleted automatically when node exits, but can
also be removed manually with the `destroy` and `destroySync` methods. By default, all temporary directories are created
securely, relative to the operating system temp directory with a `node-` prefix.

```js
// Create a temporary directory (async)
const dir = await Path.tempDir();
await dir.child('test.txt').touch();
await dir.destroy();

// Create a temporary directory (sync)
const dir = Path.tempDirSync();
dir.child('test.txt').touchSync();
dir.destroySync();

// Create a temporary directory inside of a specific directory with a name prefix
const dir = await Path.tempDir({dir: new Path('/tmp'), name: 'mojo-'});
```

Everything is optimized for modern JavaScript with `async`/`await`.

```js
// Update atime and mtime
const file = await new Path('test.txt').utimes(new Date(), new Date());
const file = new Path('test.txt').utimesSync(new Date(), new Date());

// Symlink file
const file = await new Path('foo.txt').symlink(new Path('bar.txt'));
const file = new Path('foo.txt').symlinkSync(new Path('bar.txt'));

// Copy file
const file = await new Path('foo.txt').copyFile(new Path('bar.txt'));
const file = new Path('foo.txt').copyFileSync(new Path('bar.txt'));

// Rename file
await new Path('foo.txt').rename(new Path('bar.txt'));
new Path('foo.txt').renameSync(new Path('bar.txt'));

// Truncate file
const file = await new Path('foo.txt').truncate(5);
const file = new Path('foo.txt').truncateSync(5);

// Check is file is a directory (async)
const stat = await new Path('test').stat();
const isDirectory = stat.isDirectory();
const lstat = await new Path('test').lstat();
const isDirectory = lstat.isDirectory();

// Check is file is a directory (sync)
const isDirectory = new Path('test').statSync().isDirectory();
const isDirectory = new Path('test').lstatSync().isDirectory();
```

## Installation

All you need is Node.js 16.0.0 (or newer).

```
$ npm install @mojojs/path
```
