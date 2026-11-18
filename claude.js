const { execFile } = require('child_process');

// shortcut: truncates huge diffs at 150k chars, upgrade to a per-file summary if that bites
const MAX_DIFF = 150000;
const SYSTEM = 'Your final reply is pasted verbatim into the git commit message box. Reply with only the commit message: no preamble, explanation, code fences, notes or trailers.';
// args are passed positionally ($0..$3) so nothing from settings is interpolated into the shell string.
// Read-only git tools so the prompt can inspect history; hooks off so plugin output doesn't leak into the message.
const SCRIPT = '"$0" -p --model "$1" --settings \'{"disableAllHooks":true}\' --allowedTools "Bash(git log:*)" "Bash(git show:*)" "Bash(git diff:*)" "Bash(git status:*)" --append-system-prompt "$2" "$3"';

const run = (cmd, args, cwd, input) => new Promise((resolve, reject) => {
  const p = execFile(cmd, args, { cwd, maxBuffer: 64 * 1024 * 1024 }, (err, out, stderr) => {
    if (!err) return resolve(out);
    err.stderr = stderr;
    reject(err);
  });
  // ignore EPIPE when the command exits without reading stdin (e.g. tools that read the index themselves)
  p.stdin.on('error', () => {});
  if (input !== undefined) p.stdin.end(input);
});

// staged changes if any, else everything in the worktree vs HEAD
async function getDiff(cwd) {
  const staged = await run('git', ['diff', '--cached'], cwd);
  return staged.trim() ? staged : run('git', ['diff', 'HEAD'], cwd);
}

const clean = msg => msg.replace(/^Co-Authored-By:.*$/gim, '').trim();

// login shell so PATH finds `claude` even when the editor was launched from the Dock
async function askClaude({ cwd, diff, prompt, model, claudePath }) {
  const shell = process.env.SHELL || '/bin/sh';
  const out = await run(shell, ['-lc', SCRIPT, claudePath || 'claude', model, SYSTEM, prompt], cwd, diff.slice(0, MAX_DIFF));
  return clean(out);
}

// user's own command instead of claude, run through the login shell in the repo root; the diff is on stdin
async function runCustom({ cwd, diff, command }) {
  const shell = process.env.SHELL || '/bin/sh';
  return (await run(shell, ['-lc', command], cwd, diff.slice(0, MAX_DIFF))).trim();
}

module.exports = { getDiff, askClaude, runCustom, clean };
