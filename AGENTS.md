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

- `index.html`: form controls, environment options, report choices, and script loading order. Issue options are built from `data/issues.json` (`js/issues.js`).
- `styles.css`: application UI and copy-safe preview styling.
- `js/main.js`: application initialization, contact-data loading, and banner preloading.
- `data/recipients.json`: authoritative To/CC lists (`lists`, keyed like `NHL` or `NGL:Sisal TR`) and the NPI common recipients (`npiCommon`).
- `data/vendors.json`: vendor outreach contacts (`vendors`) and dedicated lottery outreach lists (`lotteryOutreach`).
- `js/utils.js`: lottery configuration, Jira mappings, timezones, date formatting, banner embedding, and clipboard utilities.
- `js/recipientLists.js`: recipient composition rules (NPI merge, required CC).
- `js/vendorContacts.js`: outreach recipient rules and vendor suggestion from the external team name.
- `js/templateGenerator.js`: approved Ongoing and Resolved email HTML.
- `js/formHandlers.js`: dynamic form state, validation, preview generation, and copy actions.
- `tests/`: Node built-in test suite for templates, recipients, configuration, and time conversion.
- `images/banner-opening.png`: ongoing notification banner.
- `images/banner-resolved.png`: resolved notification banner.

Contact data is fetched as JSON at startup (with `cache: 'no-cache'`), so the page must be served over HTTP; opening `index.html` via `file://` shows a load error. Lists that used to be shared constants (the Turkish Sisal To lists, `BRIGHTSTAR_ESCALATION`) are now stored as separate copies per key, so change every copy when one changes.

Browser script order matters. `utils.js`, `recipientLists.js`, and `vendorContacts.js` (in that order) must load before the template and form scripts that use them.

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
- Sisal Misli, Sisal Nesine, Sisal Bilyoner → Jira `NGL`, `Europe/Istanbul`
- Sisal Atili Ganyan, Sisal At Yarisi → Jira `NGL`, `Europe/Istanbul`
- JSC → Jira `NGL`
- UNL → Jira `UNL`

USLOT selections:

- IGT Georgia → Jira `GAL`
- Atlantic City → Jira `ALC`

`PariPlay/888` was intentionally removed and must not be restored without a new request.

## Time and Date Rules

- Operators always enter incident times in **Israel local time** (`Asia/Jerusalem`).
- System incident start and resolution controls deliberately use separate, clearly labeled Date and Time inputs. Keep this operator-friendly layout; clicking the inputs should open their native pickers.
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
- `Decrease in bets` requires a percentage, but the percentage appears only in the Impact description—not the subject or detection sentence. This does not apply to the approved-deposit wording described below.
- Generic processor/provider templates must use placeholders. Never hardcode Paysafe, Brightstar, or another example provider as the default.
- Rejected and declined deposit incidents require an explicit Yes/No answer to `Are approved deposits affected?` with no default selection. When Yes, append `followed by a decrease in approved deposits` only in the Impact description; keep the subject and detection sentence unchanged. Failed-deposit incidents do not use this question.
- The interruption template requires approximate frequency and duration in minutes.
- Interruption impact wording changes tense between Ongoing and Resolved.
- For an external team root cause, remove a trailing word `team` from operator input before generating `We have reached out to [name] team...` so the result never says `team team`.
- Ongoing external wording uses `are waiting`; Resolved uses `are still waiting`.

Every NG-LOT and USLOT selection currently uses fixed `Drop in bets via [selected lottery]` incident wording. The issue selector is disabled for those configured contexts, and the selected lottery is suggested as the external team.

## Recipient Lists

`data/recipients.json` is the authoritative source. It was manually transcribed and visually verified against the supplied Confluence PDF playbook.

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

Turkish Sisal lotteries (added from the operator's list, not the PDF playbook):

- Sisal Misli, Sisal Nesine, and Sisal Bilyoner share one To list; Sisal Atili Ganyan and Sisal At Yarisi share another. There is no third lottery in the second group.
- Both groups use the existing Turkey standard CC list, which matched the supplied CC exactly.
- Alessandro Galli has two addresses (`@fluttersea.com` and `@sisal.it`). The operator confirmed both belong in both groups. The duplicated `alessandro.galli@sisal.it` in the second group is preserved from the source.

The original source was named `NOC-😇How to use critical notification templates-150926-141738.pdf` and was supplied outside the repository. It may not be present in future clones, so the checked-in recipient configuration and tests are the maintainable source unless the user supplies an updated playbook.

## Vendor / Lottery Outreach Email

When an external team is contacted, NOC also emails that vendor or lottery to confirm whether the issue is on their side and to request a root cause.

- Shown only for **System Issue** + root cause **External team contacted** + **Ongoing**. It is sent once; there is no resolved version.
- Subject: `Aristocrat NOC - [lottery name] - [issue description]`. Use the lottery's display name (for example `Sisal TR`), never `NG-LOT`.
- Body: the detection line and the start-time line from the critical email, in the lottery's local time, followed by the operator-approved fixed line: "We have not found any errors or issues on our side. Please check on your side and let us know if there is any maintenance or planned work that may be related." No banner, impact, or root cause. The NOC engineer adds specific error-log findings after pasting; do not generate error-log details.
- CC is always `NOCShiftLeaders@aristocrat.com` and `noc-ng@aristocrat.com`.
- NG-LOT and USLOT lotteries default to the lottery's own contacts. Lotteries without a dedicated outreach list fall back to their critical To list; OPAP has neither and shows a no-contacts message.
- Other environments get a vendor suggestion from the external team name. Brightstar and Gambyt have environment-specific lists (Brightstar MSL and VAL; Gambyt MSL/NHL vs MASSL). Brightstar VAL and MSL both include the five-address Brightstar escalation path (`BRIGHTSTAR_ESCALATION`); MSL also keeps `michigan.ops@`. Other environments use the general `REN.Ops@` list. The operator's manual selection is kept until the environment changes.
- Vendor and lottery addresses follow the same exact-copy rules as the playbook recipients.
- Operator-confirmed decisions: "the NOC email" in the outreach CC is `noc-ng@aristocrat.com`; Gambyt's "MAL" list in the source refers to MASSL; specific error-log details are never generated (the fixed "no errors on our side" line was approved on 2026-10-08).
- Contacts live in `data/vendors.json` (`vendors`, `lotteryOutreach`). To add a vendor, add an entry with lowercase `matches` keywords, plus `environments` only when the vendor has lottery-specific lists, and update `tests/vendorContacts.test.js`.

## Admin Mode

`js/admin.js` lets the owner edit the contact data from the live page, including from a phone. It is single-user by design.

- The header **Admin** button asks for a fine-grained GitHub token (this repository only, Contents read/write), validates it, and stores it in that browser's `localStorage`. Clicking it again offers log out.
- In admin mode, red Edit buttons appear next to the critical To/CC lists (for the selected environment) and the outreach Send To (selected vendor or lottery), plus **New vendor**.
- Save reads the latest file from GitHub, applies the change, and commits it straight to `main` with an `Admin: ...` message. GitHub Pages then redeploys. There is no review step or pre-save test run.
- Pasted text is parsed by `parseAddressList`, which keeps order, spelling, and duplicates exactly and accepts Outlook `Name <address>` lists.
- Recipient editing covers only the customer-specific lists; the NPI common list and the `NOCShiftLeaders@` rule stay in code. Clearing a list deletes that key. An empty lottery outreach list falls back to the critical To list.
- **✏️ Edit issues** (next to Issue Description) edits `data/issues.json` as one issue per line: `[Provider / channel]` or `[Payment processor]` marks the operator input, and options after `|` are `%`, `interruption`, and `ask approved deposits`. Existing labels are kept; `Other (Custom)` is always added in code. The approved-deposits impact wording relies on the issue ending in `via ... processor`.
- **✏️ Edit providers** (next to Provider / channel) edits the selected environment's providers and subproviders as `Provider: Sub A, Sub B` lines, plus the global internal-provider list.
- Editing a vendor keeps extra fields such as `environments`. Shared-list copies (Turkish Sisal, Brightstar escalation) are not updated together.

## Providers and Subproviders

`data/providers.json` lists, per environment, the providers NOC contacts and their subproviders (from the operator's list, with names cleaned up). `js/providers.js` resolves the Provider / channel input.

- NOC contacts the provider, never the subprovider. The subject and impact keep the typed subprovider (`Decrease in bets via Adell`), while the external team, root cause, and outreach use the provider (IsoftBet).
- Mappings are per environment: the same studio can belong to different providers (Hacksaw is IsoftBet in SZ, Fusion in AGLC).
- Names match ignoring case, spaces, and punctuation.
- `internalProviders` (Fusion) are Aristocrat platforms in every environment: the root cause is set automatically to `Under Aristocrat teams investigation` and no outreach email is shown. The automatic root cause is undone when the provider changes, unless the operator chose the root cause by hand.
- The Provider / channel input suggests the selected environment's providers and subproviders; free text still works, and unmapped environments behave as before.
- WCLC (AGLC) has no outreach contacts yet: the operator's address was ambiguous and must be confirmed.

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
node --check js/vendorContacts.js
git diff --check
```

For browser testing, serve the repository instead of relying on `file://`, because banner fetching and the modern clipboard API need an HTTP origin:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

When changing business mappings, add or update tests. Contact data changes through admin mode, so tests check its structure rather than exact list counts, plus selected unusual addresses and duplicates, NPI scope, missing OPAP contacts, and the universal NOC Shift Leaders alias.

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
