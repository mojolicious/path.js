import fsPromises from 'fs/promises';
import path from 'path';
import url from 'url';
import Path from '../lib/path.js';
import t from 'tap';

t.test('Path', async t => {
  t.test('Constructor', t => {
    t.equal(new Path().toString(), process.cwd());
    t.equal(new Path('foo', 'bar', 'baz').toString(), path.join('foo', 'bar', 'baz'));
    t.equal(new Path('foo', 'bar').sibling('baz').toString(), path.join('foo', 'baz'));
    t.equal('' + new Path('foo', 'bar', 'baz'), path.join('foo', 'bar', 'baz'));
    t.same(new Path('foo', 'bar', 'baz').toArray(), path.join('foo', 'bar', 'baz').split(path.sep));
    t.same(new Path('foo', 'bar.txt').toFileURL(), url.pathToFileURL(path.join('foo', 'bar', 'baz')));
    t.same(new Path('foo', 'bar.txt').toObject(), path.parse(path.join('foo', 'bar.txt')));
    t.end();
  });

  t.test('basename', t => {
    t.equal(new Path('foo', 'bar', 'file.t').basename(), 'file.t');
    t.equal(new Path('foo', 'bar', 'file.t').basename('.t'), 'file');
    t.end();
  });

  t.test('dirname', t => {
    const dirname = path.dirname(path.join('foo', 'bar', 'file.t'));
    t.equal(new Path('foo', 'bar', 'file.t').dirname().toString(), dirname);
    t.end();
  });

  t.test('extname', t => {
    t.equal(new Path('foo', 'bar', 'file.t').extname(), '.t');
    t.equal(new Path('file.html.ejs').extname(), '.ejs');
    t.end();
  });

  t.test('normalize', t => {
    t.equal(
      new Path('foo', 'bar', '..', 'file.t').normalize().toString(),
      path.normalize(path.join('foo', 'bar', '..', 'file.t'))
    );
    t.end();
  });

  t.test('isAbsolute', t => {
    t.same(new Path('file.t').isAbsolute(), false);
    t.same(new Path('/etc/passwd').isAbsolute(), true);
    t.end();
  });

  await t.test('realpath', async t => {
    const realPath = await fsPromises.realpath('.');
    t.equal((await new Path('.').realpath()).toString(), realPath);
    t.equal(new Path('.').realpathSync().toString(), realPath);
  });

  await t.test('I/O', async t => {
    const dir = await Path.tempDir();

    t.ok(dir);
    t.ok(await dir.stat());

    t.same(await dir.child('test.txt').exists(), false);
    t.same(dir.child('test.txt').existsSync(), false);
    await dir.child('test.txt').writeFile('Hello Mojo!');
    t.same(await dir.child('test.txt').exists(), true);
    t.same(dir.child('test.txt').existsSync(), true);
    t.same(await dir.child('test.txt').isReadable(), true);
    t.same(await dir.child('test.txt').isWritable(), true);
    t.same(await dir.child('test.txt').access(Path.constants.R_OK), true);
    t.same(dir.child('test.txt').isReadableSync(), true);
    t.same(dir.child('test.txt').isWritableSync(), true);
    t.same(dir.child('test.txt').accessSync(Path.constants.R_OK), true);
    t.ok(await dir.child('test.txt').stat());

    t.equal((await dir.child('test.txt').readFile()).toString(), 'Hello Mojo!');
    t.equal(dir.child('test.txt').readFileSync().toString(), 'Hello Mojo!');
    t.equal(await dir.child('test.txt').readFile('utf8'), 'Hello Mojo!');

    await dir.child('test.txt').rm();
    t.same(await dir.child('test.txt').exists(), false);
    t.same(await dir.child('test.txt').isReadable(), false);
    t.same(await dir.child('test.txt').access(Path.constants.R_OK), false);
    t.same(dir.child('test.txt').isReadableSync(), false);
    t.same(dir.child('test.txt').accessSync(Path.constants.R_OK), false);

    const baz = dir.child('baz.txt');
    const fh = await baz.open('w');
    await fh.write('Hello ');
    await fh.write('JavaScript!');
    await fh.close();
    t.equal(await baz.readFile('utf8'), 'Hello JavaScript!');
  });

  await t.test('I/O (append)', async t => {
    const dir = await Path.tempDir();

    const append = dir.child('append.txt').writeFileSync('Hello');
    t.equal(await append.readFile('utf8'), 'Hello');
    t.equal(await (await append.appendFile(' World')).readFile('utf8'), 'Hello World');
    await append.appendFile('!');
    t.equal(await append.readFile('utf8'), 'Hello World!');

    const append2 = dir.child('append2.txt').writeFileSync('Hello');
    t.equal(append2.readFileSync('utf8'), 'Hello');
    t.equal(append2.appendFileSync(' World').readFileSync('utf8'), 'Hello World');
    append2.appendFileSync('!');
    t.equal(append2.readFileSync('utf8'), 'Hello World!');

    const append3 = await dir.child('append3.txt').appendFile('i ♥ mojo.js', 'utf8');
    t.ok(append3.existsSync());
    t.equal(append3.readFileSync('utf8'), 'i ♥ mojo.js');

    const append4 = dir.child('append4.txt').appendFileSync('i ♥ mojo.js', 'utf8');
    t.ok(append4.existsSync());
    t.equal(append4.readFileSync('utf8'), 'i ♥ mojo.js');
  });

  await t.test('I/O (streams)', async t => {
    const dir = await Path.tempDir();
    const write = dir.child('test.txt').createWriteStream({encoding: 'utf8'});
    await new Promise(resolve => write.write('Hello World!', resolve));
    const read = dir.child('test.txt').createReadStream({encoding: 'utf8'});
    let str = '';
    read.on('data', chunk => {
      str = str + chunk;
    });
    await new Promise(resolve => read.once('end', resolve));
    t.equal(str, 'Hello World!');
  });

  await t.test('I/O (lines)', async t => {
    const dir = await Path.tempDir();
    const file = dir.child('test.txt');
    await file.writeFile('foo\nbar\nI ♥ Mojolicious\n', {encoding: 'utf8'});
    const lines = [];
    for await (const line of file.lines({encoding: 'utf8'})) {
      lines.push(line);
    }
    t.same(lines, ['foo', 'bar', 'I ♥ Mojolicious']);
  });

  await t.test('truncate', async t => {
    const dir = await Path.tempDir();

    const file = dir.child('test.txt');
    await file.writeFile('Hello World!');
    t.equal(await file.truncate(5).then(file => file.readFile('utf8')), 'Hello');
    await file.truncate();
    t.equal(await file.readFile('utf8'), '');

    const file2 = dir.child('test2.txt').writeFileSync('Hello World again!');
    t.equal(file2.truncateSync(13).readFileSync('utf8'), 'Hello World a');
    t.equal(file2.truncateSync().readFileSync('utf8'), '');
  });

  await t.test('copyFile and rename', async t => {
    const dir = await Path.tempDir();

    const oldFile = await dir.child('test.txt').writeFile('Hello Mojo!');
    t.same(await oldFile.exists(), true);
    const newFile = dir.child('test.new');
    t.same(await newFile.exists(), false);
    t.same((await oldFile.copyFile(newFile)).basename(), 'test.txt');
    t.same(await oldFile.exists(), true);
    t.same(await newFile.exists(), true);

    await oldFile.rm();
    t.same(await oldFile.exists(), false);
    await newFile.rename(oldFile);
    t.same(await oldFile.exists(), true);
    t.same(await newFile.exists(), false);
    t.equal(await oldFile.readFile('utf8'), 'Hello Mojo!');

    oldFile.writeFileSync('Hello Mojo again!');
    t.same(oldFile.existsSync(), true);
    t.same(newFile.existsSync(), false);
    t.same(oldFile.copyFileSync(newFile).basename(), 'test.txt');
    t.same(oldFile.existsSync(), true);
    t.same(newFile.existsSync(), true);

    oldFile.rmSync();
    t.same(oldFile.existsSync(), false);
    newFile.renameSync(oldFile);
    t.same(oldFile.existsSync(), true);
    t.same(newFile.existsSync(), false);
    t.equal(oldFile.readFileSync('utf8'), 'Hello Mojo again!');
  });

  await t.test('touch', async t => {
    const dir = await Path.tempDir();
    const file = dir.child('test.txt');
    t.notOk(await file.exists());
    t.ok(await (await file.touch()).exists());
    const future = new Date();
    future.setDate(future.getDate() + 10);
    await file.utimes(future, future);
    t.not((await (await file.touch()).stat()).mtimeMs, future.getTime());

    const dir2 = Path.tempDirSync();
    const file2 = dir2.child('test.txt');
    t.notOk(file2.existsSync());
    t.ok(file2.touchSync().existsSync());
    const future2 = new Date();
    future2.setDate(future2.getDate() + 10);
    t.not(file2.utimesSync(future2, future2).touchSync().statSync().mtimeMs, future2.getTime());
  });

  await t.test('mkdir', async t => {
    const dir = await Path.tempDir();
    const foo = dir.child('foo');
    const bar = foo.child('bar');
    await bar.mkdir({recursive: true});
    t.ok(await bar.exists(), true);
    t.ok(await foo.exists(), true);

    const dir2 = Path.tempDirSync();
    const foo2 = dir2.child('foo');
    const bar2 = foo2.child('bar');
    t.ok(bar2.mkdirSync({recursive: true}).existsSync(), true);
    t.ok(foo.existsSync(), true);
  });

  await t.test('list', async t => {
    const dir = await Path.tempDir();

    const foo = dir.child('foo');
    const bar = foo.child('bar');
    await bar.mkdir({recursive: true});
    await bar.child('one.txt').writeFile('First');
    await foo.child('two.txt').writeFile('Second');
    await foo.child('.three.txt').writeFile('Third');
    t.ok((await dir.child('foo').stat()).isDirectory());
    t.ok(dir.child('foo').statSync().isDirectory());
    t.ok((await dir.child('foo', 'bar').stat()).isDirectory());
    t.notOk((await dir.child('foo', 'bar', 'one.txt').stat()).isDirectory());

    const recursive = [];
    for await (const file of dir.list({recursive: true})) {
      recursive.push(file.toString());
    }
    t.same(recursive.sort(), [bar.child('one.txt').toString(), foo.child('two.txt').toString()]);
    t.same(dir.relative(recursive.sort()[0]).toArray(), ['foo', 'bar', 'one.txt']);

    const nonRecursive = [];
    for await (const file of foo.list()) {
      nonRecursive.push(file.toString());
    }
    t.same(nonRecursive.sort(), [foo.child('two.txt').toString()]);

    const nonRecursiveDir = [];
    for await (const file of foo.list({dir: true, hidden: true})) {
      nonRecursiveDir.push(file.toString());
    }
    const expected = [foo.child('.three.txt').toString(), foo.child('bar').toString(), foo.child('two.txt').toString()];
    t.same(nonRecursiveDir.sort(), expected);

    const deep = dir.child('one', 'two', 'three', 'four', 'five');
    await deep.mkdir({recursive: true});
    await deep.child('deep.txt').touch();
    const deepRecursive = [];
    for await (const file of dir.list({recursive: true, dir: true})) {
      deepRecursive.push(file.basename());
    }
    t.same(deepRecursive.sort(), [
      'bar',
      'deep.txt',
      'five',
      'foo',
      'four',
      'one',
      'one.txt',
      'three',
      'two',
      'two.txt'
    ]);
    const twoLevels = [];
    for await (const file of dir.list({recursive: true, dir: true, maxDepth: 2})) {
      twoLevels.push(file.basename());
    }
    t.same(twoLevels.sort(), ['bar', 'foo', 'one', 'one.txt', 'three', 'two', 'two.txt']);
    const oneLevel = [];
    for await (const file of dir.list({recursive: true, dir: true, maxDepth: 1})) {
      oneLevel.push(file.basename());
    }
    t.same(oneLevel.sort(), ['bar', 'foo', 'one', 'two', 'two.txt']);
    const threeLevels = [];
    for await (const file of dir.list({recursive: true, dir: true, maxDepth: 3})) {
      threeLevels.push(file.basename());
    }
    t.same(threeLevels.sort(), ['bar', 'foo', 'four', 'one', 'one.txt', 'three', 'two', 'two.txt']);

    await bar.rm({recursive: true});
    t.same(await bar.exists(), false);
  });

  await t.test('symlink', async t => {
    const dir = await Path.tempDir();

    const link = dir.child('test-link');
    const orig = await link
      .sibling('test')
      .mkdir()
      .then(orig => orig.symlink(link));
    await orig.child('test.txt').writeFile(Buffer.from('Hello Mojo!'));
    t.same((await link.lstat()).isDirectory(), false);
    t.same((await orig.stat()).isDirectory(), true);
    t.same((await orig.lstat()).isDirectory(), true);
    t.same(await link.child('test.txt').readFile('utf8'), 'Hello Mojo!');

    const link2 = dir.child('test-link2');
    const orig2 = link2.sibling('test2').mkdirSync().symlinkSync(link2);
    orig2.child('test2.txt').writeFileSync(Buffer.from('Hello Mojo!'));
    t.same(link2.lstatSync().isDirectory(), false);
    t.same(orig2.statSync().isDirectory(), true);
    t.same(orig2.lstatSync().isDirectory(), true);
    t.same(link2.child('test2.txt').readFileSync('utf8'), 'Hello Mojo!');
  });

  await t.test('chmod', async t => {
    const dir = await Path.tempDir();

    const file = await dir.child('test.txt').touch();
    t.same(await file.isWritable(), true);
    t.same(await (await file.chmod(Path.constants.O_RDONLY)).isWritable(), false);

    const file2 = dir.child('test2.txt').touchSync();
    t.same(file2.isWritableSync(), true);
    t.same(file2.chmodSync(Path.constants.O_RDONLY).isWritableSync(), false);
  });

  await t.test('chown', async t => {
    const dir = await Path.tempDir();

    const file = await dir.child('test.txt').touch();
    const statBefore = await file.stat();
    const statAfter = await (await file.chown(statBefore.uid, statBefore.gid)).stat();
    t.equal(statBefore.uid, statAfter.uid);
    t.equal(statBefore.gid, statAfter.gid);

    const file2 = dir.child('test2.txt').touchSync();
    const statBefore2 = file2.statSync();
    const statAfter2 = file2.chownSync(statBefore.uid, statBefore.gid).statSync();
    t.equal(statBefore2.uid, statAfter2.uid);
    t.equal(statBefore2.gid, statAfter2.gid);
  });

  await t.test('tempDir', async t => {
    const temp = await Path.tempDir();
    const dir = new Path(temp.toString());
    t.same(await dir.exists(), true);
    t.same(await temp.exists(), true);
    await dir.child('test.txt').writeFile('Hello Mojo!');
    t.same(await dir.child('test.txt').exists(), true);
    t.equal((await dir.child('test.txt').readFile()).toString(), 'Hello Mojo!');
    await temp.destroy();
    t.same(await dir.exists(), false);
    t.same(await temp.exists(), false);

    const temp2 = Path.tempDirSync();
    const dir2 = new Path(temp2.toString());
    t.same(dir2.existsSync(), true);
    t.same(temp2.existsSync(), true);
    dir2.child('test.txt').writeFileSync('Hello Mojo!');
    t.same(dir2.child('test.txt').existsSync(), true);
    t.equal(dir2.child('test.txt').readFileSync().toString(), 'Hello Mojo!');
    temp2.destroySync();
    t.same(dir2.existsSync(), false);
    t.same(temp2.existsSync(), false);

    const temp3 = await Path.tempDir();
    const temp4 = await Path.tempDir({dir: temp3, name: 'mojo-'});
    t.equal(temp4.dirname().toString(), temp3.toString());
    t.match(temp4.basename(), /^mojo-/);
    t.same(await temp3.exists(), true);
    t.same(await temp4.exists(), true);
    await temp4.child('test.txt').writeFile('Hello Mojo!');
    t.same(await temp4.child('test.txt').exists(), true);
    t.equal((await temp4.child('test.txt').readFile()).toString(), 'Hello Mojo!');
    await temp3.destroy();
    t.same(await temp3.exists(), false);
    t.same(await temp4.exists(), false);

    const temp5 = Path.tempDirSync();
    const temp6 = Path.tempDirSync({dir: temp5, name: 'mojo-'});
    t.equal(temp6.dirname().toString(), temp5.toString());
    t.match(temp6.basename(), /^mojo-/);
    t.same(temp5.existsSync(), true);
    t.same(temp6.existsSync(), true);
    temp6.child('test.txt').writeFileSync('Hello Mojo!');
    t.same(temp6.child('test.txt').existsSync(), true);
    t.equal(temp6.child('test.txt').readFileSync().toString(), 'Hello Mojo!');
    temp5.destroySync();
    t.same(temp5.existsSync(), false);
    t.same(temp6.existsSync(), false);
  });
});
