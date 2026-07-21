# Usability Testing Tasks — Workspace & Profile Settings

**Target participants:** IT administrators  
**Format:** Unmoderated sessions; tasks are randomized across participants  
**Completion signal:** Each task includes a verifiable end state

---

## Instructions shown to participants

> You'll be testing a settings area of SAP Signavio. Imagine you are the IT administrator for your company's Signavio workspace. Complete each task as you would in your real job. Think out loud as you go. There are no wrong answers — we're testing the product, not you.
>
> Some tasks ask you to make a change; others ask you to find information. When you're done with a task, say "done" out loud and click Continue.

---

## SECTION A — Users & Access

### Task A1 — Add a new user to a group
> Your colleague **Maria Gomes** (maria.gomes@example.com) has joined the Modeling team. Add her to the **Modelers** group so she gets the right access automatically.

**Success:** Maria Gomes appears as a member of the Modelers group.

---

### Task A2 — Check what a user can access
> Your manager wants to know exactly what content **Lucas Ritter** can access and which features he can use. Find that information and tell us what you see.

**Success:** Participant navigates to the user detail view and locates the effective permissions (Features & Content Access tabs or equivalent).

---

### Task A3 — Remove a user's license
> The employee **Sandra Koch** has left the company. Remove her license from the workspace so the seat becomes available for someone else.

**Success:** Sandra Koch no longer holds a license (license count updates or user is marked without a license).

---

### Task A4 — Create a new group
> You need to set up a dedicated group for the **Finance department**. Create a group called "Finance" and configure it so that any new user who joins the workspace is automatically added to it.

**Success:** A group named "Finance" exists and the auto-add toggle is enabled for it.

---

### Task A5 — Restrict a feature for a specific audience
> After a recent policy change, the **Newsfeed** feature should be disabled for the **General audience**. Make that change.

**Success:** The Newsfeed feature is toggled off for the General audience in Feature Access.

---

### Task A6 — Grant folder access to a group
> The **Finance** group needs **Editor** access to the folder **"Finance Processes"** in the content library. Set that up.

**Success:** The Finance group has Editor rights on the Finance Processes folder in Content Access.

---

## SECTION B — Workspace Settings

### Task B1 — Rename the workspace
> Your company was recently rebranded. Update the workspace name from whatever it currently says to **"Acme Corp Process Hub"**.

**Success:** The workspace name field displays "Acme Corp Process Hub" and the change is saved.

---

### Task B2 — Upload a company logo
> The header currently shows no company logo. Upload any image file as the workspace logo and set the logo link to **https://acme-corp.com**.

**Success:** A logo image is set and the link target is saved.

---

### Task B3 — Change the header color
> The current header color doesn't match the new brand guidelines. Change the header background color to the hex value **#1D4E8F**.

**Success:** The header preview reflects the new color and the hex value is saved.

---

### Task B4 — Add a help link
> Your team has an internal wiki page for Signavio tips. Add it as a help link with the label **"Internal Signavio Wiki"** pointing to **https://wiki.acme-corp.com/signavio**. It should be visible to all audiences.

**Success:** A help link with that label and URL appears in the Help Resources list.

---

### Task B5 — Reorder navigation items
> Users keep missing the **Value Accelerator Library** because it's buried at the bottom of the navigation panel. Move it to appear directly below the **Modeling Files** item.

**Success:** Value Accelerator Library appears immediately after Modeling Files in the navigation list.

---

### Task B6 — Disable collaboration ratings
> After a quarterly review, leadership decided that users should no longer be able to **rate processes**. Turn off the rating feature.

**Success:** Process rating is disabled (the rating permission toggles are off or the feature is fully disabled).

---

### Task B7 — Set the default navigation state
> New users are confused by the navigation panel. Set it to start **collapsed** by default so the main content gets more space.

**Success:** The default navigation state is set to "Collapsed".

---

### Task B8 — Add a second content language
> Your workspace currently only uses English. Add **German** as a content language and make English remain the default.

**Success:** German appears in the languages list; English is still marked as default.

---

### Task B9 — Enable read confirmations
> Your compliance team requires that users confirm they have read key processes. Enable the **read confirmation** feature.

**Success:** The read confirmation toggle is on and the change is saved.

---

### Task B10 — Enable SAML authentication
> Your IT security team has set up SSO via SAML 2.0. Enable SAML authentication and configure it to automatically create accounts for users who sign in for the first time.

**Success:** SAML 2.0 toggle is on and the auto-create accounts option is enabled.

---

## SECTION C — Page Layout

### Task C1 — Hide the entry diagram on the home page
> The entry diagram section on the home page is rarely used and clutters the screen. Disable it so it no longer appears.

**Success:** The entry diagram section toggle is off on the Home Page settings.

---

### Task C2 — Customize the home page welcome message
> Update the home page header to display the title **"Welcome to Acme's Process Hub"** for the English language.

**Success:** The English welcome title field contains the new text and is saved.

---

### Task C3 — Change the notation set on the diagram page
> Your organization has standardized on **BPMN 2.0**. Change the notation set on the model page settings to reflect this.

**Success:** The notation set selector shows BPMN 2.0 selected.

---

### Task C4 — Enable fact sheets and set as default view
> You want process owners to land on the fact sheet instead of the diagram when they open a process. Enable the fact sheet and set it as the default view.

**Success:** The fact sheet is enabled and the "set as default view" option is on.

---

### Task C5 — Allow diagram downloads
> Modelers are requesting the ability to download process diagrams. Enable download permissions on the diagram page.

**Success:** The download permission toggle is on.

---

## SECTION D — User Profile & Personal Settings

### Task D1 — Update personal information
> You've recently changed your phone number to **+49 160 9876543**. Update it in your account settings.

**Success:** The phone number field in Account settings shows the new number.

---

### Task D2 — Change the interface language
> You prefer to use Signavio in **German**. Change the interface language.

**Success:** German (Deutsch) is selected as the interface language.

---

### Task D3 — Turn off comment notifications
> You're getting too many email notifications. Turn off email notifications for **new comments** on processes.

**Success:** The "Comment created" email notification toggle is off.

---

### Task D4 — Manage cookie preferences
> A user asks how to change their cookie settings. Find the cookie preference controls and describe what options are available.

**Success:** Participant reaches the Cookies section and can describe the available options.

---

### Task D5 — Remove a subscription
> You subscribed to a process called **"Order to Cash"** a while ago but no longer need updates from it. Remove that subscription.

**Success:** The "Order to Cash" subscription no longer appears in the subscriptions list.

---

## SECTION E — Advanced / Power-user Tasks

### Task E1 — Customize the modeling color palette
> The design team wants the 5th color in the modeling palette to be changed to **#FF6B35**. Make that change.

**Success:** The 5th swatch in the color palette shows #FF6B35.

---

### Task E2 — Configure an approval workflow state
> Your governance process has a new diagram state called **"In Review"**. Add it to the approval workflow configuration with an appropriate icon.

**Success:** A state named "In Review" appears in the approval workflow states list with an icon assigned.

---

### Task E3 — Create a custom attribute definition
> Your organization tracks a custom field called **"Process Owner Department"** (a text attribute). Create this attribute definition.

**Success:** An attribute named "Process Owner Department" of type Text appears in the Attribute Definitions list.

---

## Task Randomization Notes

| Pool | Suggested tasks per session | Notes |
|---|---|---|
| Light session (20 min) | 4–5 tasks | Pick 1–2 from A, 1–2 from B, 1 from D |
| Standard session (45 min) | 8–10 tasks | At least 1 from each section |
| Deep session (60 min) | 12–15 tasks | Include 1–2 from Section E |

Avoid combining **A6 + A4** in the same session unless the participant created "Finance" in A4 (dependency). All other tasks are independent.
