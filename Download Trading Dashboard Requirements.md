# Trading Dashboard Requirements Document

## Project Overview
Develop a Trading Dashboard that consumes Chartink webhook signals, stores them in a database, displays live signals, tracks trades, provides analytics, reporting, and Telegram notifications.

## Current Flow
```text
Chartink Strategy -> Webhook -> Telegram -> Manual Trade Execution
```

## Proposed Flow
```text
Chartink Scanner
    |
Webhook API
    |
Signal Engine
   / \
Database Telegram
    |
Trading Dashboard
```

## Functional Requirements

### 1. Signal Receiver
- Receive Chartink webhook payloads
- Validate and store signals
- Prevent duplicates
- Generate Signal ID
- Trigger Telegram notifications

### 2. Signal Management
- View all signals
- Search and filter by symbol, strategy, date, signal type

### 3. Trade Execution Tracker
Statuses:
- Pending
- Entered
- Target Hit
- Stop Loss Hit
- Exited Manually
- Cancelled

### 4. Open Positions Dashboard
Display:
- Symbol
- Entry Price
- Current Price
- MTM
- P/L
- Target
- Stop Loss

### 5. Strategy Analytics
Metrics:
- Win Rate
- Profit Factor
- Average Return
- Maximum Drawdown

### 6. Telegram Integration
Send alerts for:
- New Signal
- Trade Entry
- Target Hit
- Stop Loss Hit

### 7. User Management
Roles:
- Admin
- Trader
- Viewer

### 8. Reporting
- Daily Report
- Monthly Report
- Export PDF, Excel, CSV

### 9. Audit Logs
Track system and user activities.

## Database Design

### Strategies
- strategy_id
- strategy_name
- description
- status

### Signals
- signal_id
- strategy_id
- symbol
- signal_type
- entry_price
- timestamp
- status

### Trades
- trade_id
- signal_id
- entry_price
- exit_price
- stop_loss
- target_price
- quantity
- profit_loss
- status

## Technical Architecture
- Frontend: Next.js / React
- Backend: FastAPI
- Database: PostgreSQL
- Cache: Redis
- Future Broker APIs: Zerodha, Dhan, Fyers, Upstox

# Wireframes

## Main Dashboard
```text
+--------------------------------------------------+
| Total Signals | Open Trades | P&L | Win Rate    |
+--------------------------------------------------+
| Daily P&L Chart | Strategy Distribution Chart   |
+--------------------------------------------------+
| Recent Signals Table                            |
+--------------------------------------------------+
```

## Live Signals Screen
```text
Filters: Date | Strategy | Symbol

Time | Symbol | Signal | Price | Strategy | Status
```

## Open Positions
```text
Trade ID | Symbol | Entry | CMP | MTM | Status
```

## Strategy Analytics
```text
Win Rate | Profit Factor | Avg Profit | Drawdown

Monthly Profit Chart
Strategy Comparison
```

## Reports
```text
Date Range
Report Type
Generate Report
Export PDF / Excel / CSV
```

## Admin Console
```text
Users
Strategies
Webhook Configuration
Telegram Configuration
Broker Integration
Audit Logs
```

## MVP Scope
- Webhook Receiver
- Signal Storage
- Telegram Integration
- Live Dashboard
- Trade Tracker
- Strategy Analytics
- Reports
- Authentication
