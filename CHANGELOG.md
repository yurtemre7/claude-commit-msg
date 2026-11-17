# Changelog

All notable changes to this extension are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.2] - 2026-11-17

### Changed

- Republished 0.1.1 (the **claude: commit msg!** rename) after it did not appear on the Marketplace.

## [0.1.1] - 2026-11-17

### Changed

- Renamed the extension to **claude: commit msg!**.

## [0.1.0] - 2026-11-17

### Added

- ✨ **Generate Commit Message with Claude** button in the Source Control title bar and in the Command Palette.
- Describes staged changes, or all changes against `HEAD` when nothing is staged.
- Runs the local `claude` CLI with Claude Haiku 5.5 by default.
- Default prompt that reads the past 15 commit messages to match the repo's style, falling back to Conventional Commits.
- Read-only git access for Claude (`git log`, `git show`, `git diff`, `git status`).
- **Claude: Select Commit Message Model** command to pick Haiku 5.5 (default), Sonnet 5.5, Opus 5.5, Fable 5.2 or a custom model ID.
- Settings: `claudeCommitMsg.prompt`, `claudeCommitMsg.model`, `claudeCommitMsg.claudePath`.
- Clear error with **Install Claude Code** and **Open Settings** actions when the CLI is missing.
