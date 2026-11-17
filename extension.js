const vscode = require('vscode');
const { getDiff, askClaude } = require('./claude');

const INSTALL_URL = 'https://docs.anthropic.com/en/docs/claude-code/setup';

async function generate(arg) {
  const git = vscode.extensions.getExtension('vscode.git').exports.getAPI(1);
  // the SCM title button passes its source control; otherwise use the first repo
  const repo = (arg && arg.rootUri && git.getRepository(arg.rootUri)) || git.repositories[0];
  if (!repo) return vscode.window.showErrorMessage('Claude Commit Msg!: no git repository found.');
  const cwd = repo.rootUri.fsPath;

  let diff;
  try {
    diff = await getDiff(cwd);
  } catch (e) {
    return vscode.window.showErrorMessage('Claude Commit Msg!: git diff failed: ' + (e.stderr || e.message));
  }
  if (!diff.trim()) return vscode.window.showInformationMessage('Claude Commit Msg!: no changes to describe.');

  const cfg = vscode.workspace.getConfiguration('claudeCommitMsg');
  await vscode.window.withProgress({ location: vscode.ProgressLocation.SourceControl, title: 'Claude is writing a commit message…' }, async () => {
    try {
      const msg = await askClaude({ cwd, diff, prompt: cfg.get('prompt'), model: cfg.get('model'), claudePath: cfg.get('claudePath') });
      if (!msg) throw new Error('Claude returned an empty message.');
      repo.inputBox.value = msg;
    } catch (e) {
      const notFound = e.code === 127 || /command not found|no such file/i.test(e.stderr || '');
      const text = notFound
        ? 'Claude Commit Msg!: the `claude` CLI was not found. Install Claude Code, or set its full path in settings.'
        : 'Claude Commit Msg!: ' + ((e.stderr || '').trim() || e.message);
      const pick = await vscode.window.showErrorMessage(text, ...(notFound ? ['Install Claude Code'] : []), 'Open Settings');
      if (pick === 'Install Claude Code') vscode.env.openExternal(vscode.Uri.parse(INSTALL_URL));
      if (pick === 'Open Settings') vscode.commands.executeCommand('workbench.action.openSettings', 'claudeCommitMsg');
    }
  });
}

async function selectModel() {
  const cfg = vscode.workspace.getConfiguration('claudeCommitMsg');
  const current = cfg.get('model');
  // reuse the dropdown values from package.json so the list lives in one place
  const schema = vscode.extensions.getExtension('yurtemre.claude-commit-msg').packageJSON.contributes.configuration.properties['claudeCommitMsg.model'];
  const items = schema.enum.map((id, i) => ({ label: id, description: schema.enumDescriptions[i] + (id === current ? '  ✓ current' : '') }));
  items.push({ label: 'Custom model ID…', description: 'Any ID or alias accepted by `claude --model`', custom: true });
  const pick = await vscode.window.showQuickPick(items, { placeHolder: `Model for commit messages (current: ${current})` });
  if (!pick) return;
  const model = pick.custom ? (await vscode.window.showInputBox({ prompt: 'Model ID or alias for claude --model', value: current }))?.trim() : pick.label;
  if (!model) return;
  await cfg.update('model', model, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage(`Claude Commit Msg!: now using ${model}.`);
}

exports.activate = ctx => ctx.subscriptions.push(
  vscode.commands.registerCommand('claudeCommitMsg.generate', generate),
  vscode.commands.registerCommand('claudeCommitMsg.selectModel', selectModel),
);
exports.deactivate = () => {};
