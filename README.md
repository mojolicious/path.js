<p align="center">
  <a href="https://mojojs.org">
    <img src="https://github.com/mojolicious/mojo.js/blob/main/docs/images/logo.png?raw=true" style="margin: 0 auto;">
  </a>
</p>

[![](https://github.com/mojolicious/path.js/workflows/test/badge.svg)](https://github.com/mojolicious/path.js/actions)
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

// Current file (portable)
const file = Path.currentFile();

// Caller file (portable)
const file = Path.callerFile();
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

// "/home"
new Path('/home/kraih/test.txt').dirname().dirname();

// ".json"
new Path('/home/kraih/files/test.txt').sibling('hello.json').extname();

// "file:///home/kraih/test.txt"
new Path('/home/kraih/test.txt').toFileURL().toString();

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
await new Path('/home/kraih/test.txt').touch();
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

// Read lines from file
for await (const line of new Path('test.txt').lines({encoding: 'UTF-8'})) {
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
```

Temporary directories will be deleted automatically when node stops, but can also be removed manually with the `destroy`
method. They are created relative to the operating system temp directory with `node-` prefix.

```js
// Create a temporary directory (async)
const dir = await Path.tempDir();
await dir.child('test.txt').touch();
await dir.destroy();

// Create a temporary directory (sync)
const dir = Path.tempDirSync();
dir.child('test.txt').touchSync();
dir.destroySync();
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
```

```js
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
