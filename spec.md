# Color Prediction Game

## Current State
New project, no existing application files.

## Requested Changes (Diff)

### Add
- Color prediction game: users bet on Red/Green/Violet, result announced every round
- Wallet system: each user has a balance
- Deposit system: show admin's UPI QR code, user submits amount + UTR number, admin approves from panel to credit balance
- Withdrawal system: user enters UPI ID + amount, admin sees request and marks as paid
- Admin panel: manage deposit requests, withdrawal requests, set game result, manage users
- Role-based access: regular users vs admin
- Game history: past results shown
- Bet history: user's past bets shown

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: user roles (admin/user), wallet balances, deposit requests (pending/approved/rejected), withdrawal requests, game rounds with results, bet placement and settlement
2. Frontend: Login/Register page, Game page (bet on color, countdown timer), Wallet page (deposit with QR, withdrawal form, history), Admin panel (tabs for deposits, withdrawals, game control, users)
3. UPI QR code image shown on deposit page
