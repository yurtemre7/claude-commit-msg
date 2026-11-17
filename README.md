<p align="center"><img src="images/icon.png" width="128" alt="Claude Commit Message icon"></p>

# Claude Commit Message

Write git commit messages from your diff, using the [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI you already have installed. Click the ✨ button in Source Control and the message lands in the commit box.

- **Uses your own Claude:** runs your local `claude` CLI with your existing login. You don't need an API key or extra account.
- **Fast and cheap:** uses Claude Haiku 5.5 by default.
- **Matches your repo's style:** Claude reads your recent commit history first and follows its conventions.
- **Read-only:** Claude can only run `git log`, `git show`, `git diff` and `git status`. It never commits, stages or edits files.

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/setup) installed and logged in. Check with `claude --version` in a terminal.
- VS Code 1.80 or newer with the built-in Git extension enabled.
- macOS or Linux. Windows is not supported yet.

## Install locally

The extension isn't on the Marketplace yet. To build and install it yourself (requires Node.js):

```sh
git clone https://github.com/yurtemre7/claude-commit-msg.git
cd claude-commit-msg
npx @vscode/vsce package
code --install-extension claude-commit-msg-*.vsix
```

Then run **Developer: Reload Window** in VS Code.

If the `code` command isn't available, open the Extensions view in VS Code, click **⋯** at the top and choose **Install from VSIX…**, then select the `.vsix` file.

**Updating:** run `git pull`, build again, and add `--force` to the install command.
**Uninstalling:** `code --uninstall-extension yurtemre7.claude-commit-msg`, or uninstall it from the Extensions view.

## Usage

1. Make some changes in a git repository.
2. Open the **Source Control** view and click the ✨ **Generate Commit Message with Claude** button in its title bar.
   You can also run **Claude: Generate Commit Message with Claude** from the Command Palette.
3. Review the message in the commit box, edit it if needed, and commit.

**Which changes are described:** your staged changes if you have any. Otherwise, all changes against `HEAD`. New untracked files are not included until you stage them.

## Choosing a model

Haiku 5.5 is the default. To switch, run **Claude: Select Commit Message Model** from the Command Palette or the Source Control **⋯** menu, or pick one under `claudeCommitMsg.model` in Settings. The quick pick also accepts any custom model ID or alias that `claude --model` understands.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `claudeCommitMsg.prompt` | Concise; matches the last 15 commits, Conventional Commits fallback | Instructions sent to Claude. The diff arrives on stdin. |
| `claudeCommitMsg.model` | `claude-haiku-5-5` | Model used for messages: Haiku 5.5, Sonnet 5.5, Opus 5.5 or Fable 5.2. |
| `claudeCommitMsg.claudePath` | `claude` | Path to the `claude` CLI if it isn't on your login shell's `PATH`. |

The prompt can ask Claude to look at history, for example: *"Look at the last 30 commits and match their scope names."*

## Troubleshooting

- **"the `claude` CLI was not found":** VS Code runs `claude` through your login shell. If it lives somewhere unusual, set `claudeCommitMsg.claudePath` to the output of `which claude`.
- **Login or usage errors:** run `claude` once in a terminal to log in, then try again.
- **Very large diffs** are cut off at 150,000 characters before they are sent.

## How it works

The extension runs roughly:

```sh
git diff --cached | claude -p --model claude-haiku-5-5 \
  --allowedTools "Bash(git log:*)" "Bash(git show:*)" "Bash(git diff:*)" "Bash(git status:*)" \
  "<your prompt>"
```

Your Claude Code hooks are turned off for this call, so plugin output can't end up in the message. Any `Co-Authored-By:` trailer is removed from the result.

## Disclaimer

This is a community extension. It is not affiliated with or endorsed by Anthropic.

## License

[MIT](LICENSE)
