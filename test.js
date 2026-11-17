// self-check for the pure helpers; run with `npm test`
const assert = require('assert');
const { clean } = require('./claude');
assert.strictEqual(clean('feat: add x\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n'), 'feat: add x');
assert.strictEqual(clean('fix: y\n\nbody line\n'), 'fix: y\n\nbody line');
console.log('ok');
