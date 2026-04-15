# Tools

## `telegram-web-poll-export.user.js`

Tampermonkey/Violentmonkey userscript that runs on `web.telegram.org` and:

- Collects **poll/quiz** questions from the current page as you scroll
- Deduplicates and keeps an **incremental cache** in `localStorage`
- Exports JSON in two formats:
  - **Test format**: `{ id, question, options, answer, ... }` (compatible with `test/data/*.json`)
  - **Blocks Q/A format**: `{ question, answer }` (compatible with the `blocks-data` Q/A viewer logic)

### Install

1. Install **Tampermonkey** (Chrome) or **Violentmonkey** (Firefox).
2. Create a new userscript and paste contents of `tools/telegram-web-poll-export.user.js`.
3. Open Telegram Web: `https://web.telegram.org/`

### Use

- Open a channel/chat where polls exist.
- Scroll to load more messages.
- Use the floating panel bottom-right:
  - **Scan now**: parse all currently loaded polls
  - **Download test.json**: downloads an array compatible with `test/data/*.json`
  - **Download blocks-qa.json**: downloads an array compatible with `blocks-data` Q/A viewer
  - **Reset cache**: clears stored polls

### Important

- This is **best-effort DOM extraction**. If Telegram updates their HTML structure, selectors may need updating.
- If a quiz correct answer isn't visible in DOM, `answer` will be empty.

