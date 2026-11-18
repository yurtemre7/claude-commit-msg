// self-check for the helpers; run with `npm test`
const assert = require('assert');
const { clean, runCustom } = require('./claude');
assert.strictEqual(clean('feat: add x\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n'), 'feat: add x');
assert.strictEqual(clean('fix: y\n\nbody line\n'), 'fix: y\n\nbody line');

(async () => {
  // custom command gets the diff on stdin and its output is trimmed
  assert.strictEqual(await runCustom({ cwd: __dirname, diff: 'diff body\n', command: 'cat' }), 'diff body');
  // a command that ignores a large stdin must not crash with EPIPE
  assert.strictEqual(await runCustom({ cwd: __dirname, diff: 'x'.repeat(140000), command: 'echo "feat: done"' }), 'feat: done');
  console.log('ok');
})().catch(e => { console.error(e); process.exit(1); });
