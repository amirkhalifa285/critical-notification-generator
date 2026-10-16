# 📧 Critical Notification Email Generator

A simple web tool for generating Critical Notification emails with customizable templates.

---

## ✨ Features

- **Two Notification States**: Ongoing and resolved
- **Two Template Types**: Report delays and system issues
- **Live Preview**: See your email in real-time as you type
- **Auto Date Formatting**: Converts dates to "October 2nd" format
- **Lottery-Aware Jira Keys**: Selects the correct project prefix for each lottery
- **Timezone Conversion**: Converts Israel-local input to the lottery's local time, including DST
- **NG-LOT Rules**: Applies the correct Jira project and fixed incident wording automatically
- **Generic Incident Patterns**: Reuses standard wording while operators supply the affected provider or processor
- **Vendor / Lottery Outreach Email**: When an external team is contacted, generates the separate email to the vendor or lottery with its own recipients and subject
- **Admin Mode**: The owner edits recipients, vendors, issues, and providers from the page; saves commit to GitHub and redeploy
- **Subprovider Escalation**: A subprovider is escalated to its provider (Adell → IsoftBet); Fusion is treated as internal
- **One-Click Copy**: Copy formatted email directly to clipboard
- **Embedded Status Banners**: Includes the matching ongoing or resolved banner when pasted into Outlook

---

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amit-Eizen/critical-notification-email-generator.git
   cd critical-notification-email-generator
   ```

2. **Run with a local server** (contact lists are loaded from `data/*.json`, so opening `index.html` directly does not work)
   ```bash
   python -m http.server 8000
   # Then open http://localhost:8000
   ```

---

## 📖 How to Use

### For Report Delays:
1. Select **Report Delay** template
2. Choose the lottery/environment (NCEL, NHL, VAL, NG-LOT, etc.)
3. Enter ticket number
4. Select report name and date
5. Choose Ongoing or Resolved
6. Click **Copy Email to Clipboard**
7. Paste in Outlook and send

### For System Issues:
1. Select **System Issue** template
2. Choose the lottery/environment and enter the numeric Jira ticket number
3. Select issue description
4. Enter the incident time in Israel local time and select the root cause
5. Choose Ongoing or Resolved; resolved notifications also require an end time
6. Click **Copy Email to Clipboard**
7. Paste in Outlook and send
8. If the root cause is an external team, use the **Vendor / Lottery Outreach Email** panel to copy its To, CC, Subject, and body, then add any error-log findings before sending

Report Delay is available for NCEL, NHL, and VAL. The selected notification date is Israel-local; the generated Activity Summary report date is the previous calendar day.

---

## 📁 Project Structure

```
critical-notification-email-generator/
├── index.html              # Main page
├── data/
│   ├── recipients.json    # Critical notification To/CC lists
│   ├── vendors.json       # Vendor/lottery outreach contacts
│   ├── providers.json     # Providers and subproviders per environment
│   ├── issues.json        # System issue descriptions
│   └── subproviderContacts.json # Reference-only subprovider contacts
├── styles.css              # Styling
├── js/
│   ├── main.js            # App initialization
│   ├── utils.js           # Date/time utilities
│   ├── recipientLists.js  # Critical notification To/CC lists
│   ├── vendorContacts.js  # Vendor/lottery outreach contacts
│   ├── templateGenerator.js # Email templates
│   └── formHandlers.js    # Form logic
└── images/
    ├── banner-opening.png  # Orange banner
    └── banner-resolved.png # Green banner
```

---

## 🛠️ Built With

- **HTML5** - Structure
- **CSS3** - Styling  
- **Vanilla JavaScript** - Logic (no frameworks)

---

## 🎨 Customization

**Add new issue types:**  
Edit `index.html` → Add option to Issue Description dropdown

**Add new environments:**  
Edit the dropdown in `index.html`, then add its Jira prefix and IANA timezone to `LOTTERY_CONFIG` in `js/utils.js`

**Change email templates:**  
Edit `js/templateGenerator.js` → Modify the relevant function

**Replace banners:**  
Replace images in `images/` folder

---

## 📝 License

MIT License - Feel free to use and modify

---

**Built for streamlining NOC notification workflows** 🚀
