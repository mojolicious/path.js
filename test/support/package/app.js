import assert from 'node:assert/strict';
import Path from '@mojojs/path';

assert.equal(new Path('foo', 'bar.js').basename(), 'bar.js');
assert.equal(Path.currentFile().basename(), 'app.js');

console.log('JavaScript consumer works');
