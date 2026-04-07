# AI Data Analytics Dashboard

An AI-powered data analytics tool that auto-generates interactive dashboards from CSV files and lets you chat with your data using Claude AI.

## Features

- 📊 **Auto Dashboard** — Upload any CSV and instantly get bar charts, pie charts, line trends, and key metrics
- 💬 **Chat with Data** — Ask natural language questions about your dataset powered by Claude AI
- 📋 **Data Table** — Preview your raw data with the first 10 rows
- 🔍 **Column Inspector** — Auto-detects numeric, category, and text columns

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Recharts (charting)
- PapaParse (CSV parsing)
- Anthropic Claude API (AI chat)

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-data-analytics.git
cd ai-data-analytics
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your API key
```bash
cp .env.example .env
```
Edit `.env` and add your Anthropic API key from https://console.anthropic.com

### 4. Run the app
```bash
npm run dev
```

Open http://localhost:5173

## Usage

1. Upload a CSV file from the sidebar
2. Dashboard auto-generates with charts and metrics
3. Switch to **Chat with data** tab and ask anything:
   - "Summarize this dataset"
   - "What are the top 5 rows by value?"
   - "Any outliers in the data?"
   - "Show average per category"

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx      # File upload + column inspector
│   ├── Dashboard.jsx    # Auto-generated charts + metrics
│   ├── ChatPanel.jsx    # AI chat interface
│   └── MetricCard.jsx   # Summary metric cards
├── utils/
│   └── csvParser.js     # CSV parsing + column type inference
├── App.jsx              # Main app layout + routing
└── main.jsx             # Entry point
```
