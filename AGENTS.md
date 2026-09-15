# Critical Notification Generator — Maintainer Guide

This file is the primary context for future coding agents working on this repository. Read it before changing business logic, templates, customer mappings, recipient lists, date handling, or clipboard behavior.

## Purpose and Product Direction

This is an internal NOC tool that generates consistent critical-notification emails and prevents operator typos. The intended users need a fast, simple workflow with as little manual editing as possible.

Important product rules:

- Keep the workflow simple and operator-friendly.
- There are only two notification states: **Ongoing** and **Resolved**. Do not add an Update state.
- Do not add a greeting or sign-off such as `Regards`; the mail system adds that automatically.
- Preserve approved notification wording and layout. Do not rewrite templates for style unless the user explicitly approves new wording.
- Avoid guessed business logic. Jira mappings, timezones, report eligibility, recipients, and customer classifications must come from the user or an approved playbook.
- The default screen is **System Issue**, because system incidents occur more frequently than report delays.

## Application Architecture

The application is a static site using HTML, CSS, and vanilla JavaScript. There is no build step and no framework.

- `index.html`: form controls, environment options, issue/report choices, and script loading order.
- `styles.css`: application UI and copy-safe preview styling.
- `js/main.js`: application initialization and banner preloading.
- `js/utils.js`: lottery configuration, Jira mappings, timezones, date formatting, banner embedding, and clipboard utilities.
- `js/recipientLists.js`: authoritative To/CC data and recipient composition rules.
- `js/templateGenerator.js`: approved Ongoing and Resolved email HTML.
- `js/formHandlers.js`: dynamic form state, validation, preview generation, and copy actions.
- `tests/`: Node built-in test suite for templates, recipients, configuration, and time conversion.
- `images/banner-opening.png`: ongoing notification banner.
- `images/banner-resolved.png`: resolved notification banner.

Browser script order matters. `utils.js` and `recipientLists.js` must load before the template and form scripts that use them.

`README.md` is a general project overview and may lag behind current business behavior. If it conflicts with this guide, the checked-in code/tests and this `AGENTS.md` are authoritative.

## Repository and Deployment

- Primary repository/remote: `git@github.com:amirkhalifa285/critical-notification-generator.git` (`origin`).
- Original coworker repository: `https://github.com/Amit-Eizen/critical-notification-email-generator.git` (`upstream`).
- Deployment branch: `main` on `origin`.
- Live GitHub Pages site: <https://amirkhalifa285.github.io/critical-notification-generator/>
- Pushing `main` triggers the GitHub Pages deployment. When appropriate, verify the latest Pages build corresponds to the pushed commit.

The repository is private, but its GitHub Pages site is public. The user explicitly approved publishing the work recipient addresses used by the generator. Do not remove or redact them unless asked.

## Notification Subject Convention

Subjects normally follow:

`[Jira project]-[ticket number] - Critical Notification - [issue/report description]`

Operators enter only the numeric ticket number. The Jira project prefix is selected automatically from the environment configuration.

## Environments, Jira Projects, and Timezones

The authoritative runtime mapping is `LOTTERY_CONFIG` in `js/utils.js`. Keep `index.html`, `LOTTERY_CONFIG`, recipient keys, and tests synchronized when adding or renaming an environment.

Direct projects:

| Generator environment | Meaning/location | Jira prefix | Timezone/date style |
|---|---|---|---|
| AGLC | Alberta, Canada | AGLC | `America/Edmonton`, US format |
| CRO | Croatia | CRO | `Europe/Zagreb`, European format |
| FK-MI | FireKeepers, Michigan | FKC | `America/Detroit`, US format |
| MASSL | Massachusetts | MASSL | `America/New_York`, US format |
| MSL | Michigan | MSL | `America/Detroit`, US format |
| NCEL | North Carolina | NCEL | `America/New_York`, US format |
| NHL | New Hampshire | NHL | `America/New_York`, US format |
| PL | PlayLive/Pennsylvania | PL | `America/New_York`, US format |
| SZ | Czech Republic | SZ | `Europe/Prague`, European format |
| VAL | Virginia | VAL | `America/New_York`, US format |
| WV | West Virginia | WV | `America/New_York`, US format |

CRO was incorrectly grouped under NG-LOT in the notification playbook. In this generator it is intentionally a standalone environment with its own `CRO` Jira project.

NG-LOT selections:

- Sisal IT → Jira `NGL`
- Sisal TR → Jira `NGL`
- Olifeja/Perlas → Jira `NGL`
- Win2Day/W2D → Jira `NGL`
- OPAP → Jira `NGL`
- SzZrt/Hungary → Jira `HUN`
- Bitalih → Jira `NGL`
- Hipodrom → Jira `NGL`
- JSC → Jira `NGL`
- UNL → Jira `UNL`

USLOT selections:

- IGT Georgia → Jira `GAL`
- Atlantic City → Jira `ALC`

`PariPlay/888` was intentionally removed and must not be restored without a new request.

## Time and Date Rules

- Operators always enter incident times in **Israel local time** (`Asia/Jerusalem`).
- Convert those wall-clock values to the selected customer's IANA timezone, including daylight-saving changes.
- Never implement conversion with a fixed GMT offset.
- US customers use `MM/DD/YYYY` and 12-hour time with AM/PM.
- European customers use `DD/MM/YYYY` and 24-hour time.
- The email displays the destination's actual GMT offset for the incident date.
- Invalid or nonexistent Israel wall times around DST changes must be rejected.
- Custom environments retain Israel time until an authoritative destination timezone is supplied.

Report notification dates are selected as the Israel notification date. The date written in the email is the previous calendar day, using wording such as `September 14th`.

## Report Delay Workflows

The Report Type field initially has no selection so operators can choose the environment first or the report type first.

When no report type is selected, the environment dropdown permits every report-capable customer. Choosing an environment automatically selects its compatible report type:

- NCEL, NHL, or VAL → **Activity Summary Daily**.
- PL or FK-MI → **Missing Regulatory Reports**.

Selecting the report type first also filters the environments correctly.

### Activity Summary Daily

- Available only for NCEL, NHL, and VAL.
- The email report date is one calendar day before the selected Israel notification date.
- Root cause is fixed to `Under Aristocrat BI team investigation.`
- Preserve the existing approved Ongoing and Resolved template structures.

### Missing Regulatory Reports

- This is a B2B-only workflow available only for PL and FK-MI.
- Subject description: `Missing Regulatory Reports for [previous-day date]`.
- Frequency is selected as `Daily` or `Weekly`.
- Operators enter one missing report filename per line.
- Each filename is rendered on its own line in the Impact description.
- Ongoing impact wording ends with `for [date] are being delayed.`
- Resolved impact wording ends with `for [date] were delayed.`
- Detection time defaults to `16:10` Israel time but remains editable.
- Detection and resolved times are converted to the selected customer's local timezone.
- Resolved notifications require an end time later than the detection time.
- Root cause is always `Under Aristocrat BI team investigation.` and is not operator-editable.

## System Issue Rules

System Issue is the default template tab.

Common approved issue patterns include:

- Drop in bets via a provider, processor, mobile, application platform, or web platform.
- Increase in failed logins followed by decrease in bets.
- Increase in failed logins followed by drop in bets.
- Decrease in bets via application platform.
- Approved/failed/rejected/declined deposit and cashout patterns with an operator-provided processor.
- Interruptions in bets, optionally via a provider or channel.
- Hosting website unavailable.
- A custom description fallback.

Business wording rules:

- `Drop` means zero bets and does not require a percentage.
- `Decrease` requires a percentage, but the percentage appears only in the Impact description—not the subject or detection sentence.
- Generic processor/provider templates must use placeholders. Never hardcode Paysafe, Brightstar, or another example provider as the default.
- The interruption template requires approximate frequency and duration in minutes.
- Interruption impact wording changes tense between Ongoing and Resolved.
- For an external team root cause, remove a trailing word `team` from operator input before generating `We have reached out to [name] team...` so the result never says `team team`.
- Ongoing external wording uses `are waiting`; Resolved uses `are still waiting`.

Every NG-LOT and USLOT selection currently uses fixed `Drop in bets via [selected lottery]` incident wording. The issue selector is disabled for those configured contexts, and the selected lottery is suggested as the external team.

## Recipient Lists

`js/recipientLists.js` is the authoritative source. It was manually transcribed and visually verified against the supplied Confluence PDF playbook.

Safety rules:

- Do not guess, add, correct, normalize, or remove recipient addresses without explicit user instruction or a new authoritative playbook.
- Preserve spelling and capitalization exactly, including unusual-looking addresses.
- Preserve intentional repeated addresses from the source lists.
- `NOCShiftLeaders@aristocrat.com` must appear exactly once in every final CC list that has playbook contacts.
- Recipient fields are semicolon-separated for direct Outlook paste.
- To and CC have separate copy buttons and remain manually selectable.
- NPI common recipients apply **only** to AGLC, NCEL, VAL, and WV.
- OPAP remains a valid environment but has no contacts in the supplied playbook. Show the no-contacts message and do not invent a list.
- Custom environments have no automatic recipient list.

Some entries may look suspicious but are intentionally copied exactly from the playbook, including `it.operations@ALC.ca` for Atlantic City and `oleksandr.astakhov@neogames` for SzZrt. Do not silently repair them.

The original source was named `NOC-😇How to use critical notification templates-150926-141738.pdf` and was supplied outside the repository. It may not be present in future clones, so the checked-in recipient configuration and tests are the maintainable source unless the user supplies an updated playbook.

## Email Preview and Clipboard Behavior

- `Copy Email to Clipboard` copies the email body as rich HTML and plain text.
- The subject is shown in the preview but is intentionally excluded from the copied email body.
- Banners are fetched and converted to data URLs before copying so they paste into Outlook with the message.
- Email template output uses `<br>` line breaks rather than paragraph elements.
- Keep the email body background explicitly white.
- These choices prevent Outlook/manual browser selection from showing gray boxes around every line. Do not reintroduce block-level styling, borders, or background fills into generated email text without testing both copy methods.
- Both workflows must remain usable:
  1. Clicking the Copy Email button and pasting with normal Ctrl+V.
  2. Manually selecting the preview and copying it.
- Ctrl+Shift+V intentionally removes rich formatting and cannot preserve the banner.

## Tests and Local Verification

Run the complete test suite after changes:

```bash
node --test
```

Also run syntax and whitespace checks when touching JavaScript or preparing a commit:

```bash
node --check js/formHandlers.js
node --check js/templateGenerator.js
node --check js/utils.js
node --check js/recipientLists.js
git diff --check
```

For browser testing, serve the repository instead of relying on `file://`, because banner fetching and the modern clipboard API need an HTTP origin:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

When changing business mappings, add or update tests. Recipient tests intentionally verify source-list counts, selected unusual addresses, NPI scope, missing OPAP contacts, and the universal NOC Shift Leaders alias.

## Maintenance Checklist

When adding a customer or environment:

1. Add the option to `index.html` with the appropriate report capability data attributes if applicable.
2. Add the Jira prefix, IANA timezone, and date format to `LOTTERY_CONFIG`.
3. Add an exact playbook recipient entry only when an authoritative list exists.
4. Decide explicitly whether it is a direct project, NG-LOT, USLOT, or NPI customer. Never infer this.
5. Add mapping, time conversion, recipient, and template tests as appropriate.
6. Test Ongoing and Resolved output.
7. Verify both clipboard-copy paths if template HTML changed.
8. Push `main` only when authorized and verify the GitHub Pages build.

When updating wording, compare generated output with an approved real example. Small changes in tense, punctuation, capitalization, percentage placement, provider naming, or date format can make a notification operationally incorrect.
