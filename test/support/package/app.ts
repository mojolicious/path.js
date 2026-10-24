import assert from 'node:assert/strict';
import Path from '@mojojs/path';

const file: Path = new Path('foo', 'bar.ts');
assert.equal(file.basename('.ts'), 'bar');
assert.equal(Path.currentFile().basename(), 'app.ts');

console.log('TypeScript consumer works');
