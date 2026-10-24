import t from 'tap';

// The "using" and "await using" syntax is not supported by Node.js 22
const skip = parseInt(process.versions.node) < 24 ? {skip: 'explicit resource management requires Node.js 24'} : {};

t.test('Path', async t => {
  await t.test('using keyword for temporary files', skip, async t => {
    const {default: usingTests} = await import('./support/using.ts');
    await usingTests(t);
  });
});
