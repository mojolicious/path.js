import Path from '../lib/path.js';
import t from 'tap';

t.test('Path', async t => {
  t.test('using keyword for temporary files', async t => {
    let check = Path.currentFile();

    t.test('dispose', t => {
      {
        using dir = Path.tempDirSync();
        check = new Path(dir.toString());
        const file = dir.child('foo.txt');
        t.equal(file.writeFileSync('works').readFileSync('utf-8'), 'works');
        t.same(check.existsSync(), true);
      }
      t.same(check.existsSync(), false);
      t.end();
    });

    await t.test('asyncDispose', async t => {
      let check = Path.currentFile();
      {
        await using dir = await Path.tempDir();
        check = new Path(dir.toString());
        const file = dir.child('foo.txt');
        t.equal(file.writeFileSync('works too').readFileSync('utf-8'), 'works too');
        t.same(await check.exists(), true);
      }
      t.same(await check.exists(), false);
    });
  });
});
