import type {Test} from 'tap';
import Path from '../../src/path.ts';

export default async function usingTests(t: Test): Promise<void> {
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
    let check: Path;
    {
      await using dir = await Path.tempDir();
      check = new Path(dir.toString());
      const file = dir.child('foo.txt');
      t.equal(file.writeFileSync('works too').readFileSync('utf-8'), 'works too');
      t.same(await check.exists(), true);
    }
    t.same(await check.exists(), false);
  });
}
