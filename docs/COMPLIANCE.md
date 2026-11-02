# Queenstown Lead Intelligence - Compliance & Sending Safeguards

## 1. Compliance Architecture

Queenstown Lead Intelligence is engineered with multi-layered safeguards to ensure all B2B outreach complies strictly with international commercial messaging regulations:
- **India**: Information Technology Act & TRAI Commercial Communications Regulations.
- **United Kingdom**: Privacy and Electronic Communications Regulations (PECR) - B2B corporate subscriber rules.
- **Australia**: Spam Act 2003 (inferred consent / designated business address relevance).
- **Singapore**: Personal Data Protection Act (PDPA) - B2B exclusion and DNC compliance.
- **United States**: CAN-SPAM Act of 2003.

## 2. Hard Safeguards Matrix

| Safeguard | Default State | Behavior |
| :--- | :--- | :--- |
| **Global Sending Kill-Switch** | **DISABLED (`false`)** | Outbound sending is completely halted system-wide. Messages remain in queue; no network calls are dispatched. |
| **Human Approval Mode** | **ENABLED (`true`)** | Every generated email draft must be reviewed and manually approved by a human operator before entering the sending queue. |
| **Daily Email Cap** | **5 emails / day** | Strictly limits sending volume to protect domain reputation and prevent spam-like activity. |
| **Minimum Lead Score** | **80 / 100** | Only high-priority leads with verified software opportunities and clear business relevance are eligible for outreach. |
| **Suppression Enforcement** | **AUTOMATIC** | Opt-out keywords, unsubscribe requests, and bounces automatically suppress the contact and domain. Suppressed contacts cannot be emailed under any circumstances. |
| **Sequence Auto-Cancellation** | **AUTOMATIC** | Any incoming reply from a contact immediately cancels all subsequent follow-ups (Sequences 1 & 2). |

## 3. Sender Identity & Footer Standards

Every dispatched email includes:
1. True sender identity (Queenstown Labs Engineering / Technical Director).
2. Physical operating address.
3. Functional opt-out statement: *"If you do not wish to receive operational software notes from Queenstown Labs, reply with 'unsubscribe' to be permanently removed."*

## 4. Deterministic Opt-Out Override

AI intent classification is protected by deterministic pattern matching. If incoming email text or subject matches:
```regex
\b(unsubscribe|remove\s+me|stop\s+emailing|opt\s*out|take\s+me\s+off|please\s+suppress)\b
```
The contact is immediately placed into `suppression_list` with reason `'unsubscribe'`, and all future sequence follow-ups are cancelled without relying on model inference.
