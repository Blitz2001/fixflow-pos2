# FixFlow-POS: Phase 5 Roadmap (Predictive Data Preparation)

This document outlines the final phase of the ERP-grade architecture migration for the FixFlow-POS system. This phase is designed to prepare the database for advanced Data Science pipelines and AI analysis.

*You can implement this phase after the rest of the system has been fully tested and stabilized.*

## Objective
To create a high-performance extraction layer that safely and quickly exports POS data (inventory velocity, transactions, and partner activity) into Pandas-ready structures for machine learning.

## Step 1: Database View & Materialization
We will create a new Supabase migration (e.g., `009_predictive_analytics.sql`).

Instead of writing complex JOINs on the frontend or forcing the Data Science pipeline to handle raw tables, we will use a **Materialized View** in PostgreSQL. Materialized views cache the query results, meaning massive data extractions take milliseconds instead of seconds, and they don't lock up the production tables.

### Proposed SQL (`009_predictive_analytics.sql`)
- **`analytics_sales_velocity` (Materialized View)**:
  - Join `stock_moves` with `inventory_items` to calculate exactly how fast each product is moving out of `internal` stock to `customer` locations.
  - Join with `partners` to associate sales velocity with specific customer demographics or supplier lead times.
  - Group by `day` or `week` to provide time-series data for forecasting.
- **Refresh Function**: Create a PostgreSQL function `refresh_analytics_views()` to refresh the materialized view, and a `pg_cron` schedule (or Edge Function) to run it automatically every night at midnight.

## Step 2: Next.js API Export Route
Create a dedicated API route designed to stream large datasets without hitting Vercel/Next.js timeout limits.

### Proposed File (`web/src/app/api/export/route.ts`)
- Use the `csv-stringify` library (which supports streaming).
- Query the `analytics_sales_velocity` view.
- Return a `StreamingTextResponse` (or standard Web API `ReadableStream`) with headers set to `Content-Type: text/csv` and `Content-Disposition: attachment; filename="sales_velocity_export.csv"`.
- Implement basic API Key authentication or check the session to ensure the Data Science script is authorized to pull data.

## Usage for Data Scientists
Once implemented, a Python script can ingest the data in one line:
```python
import pandas as pd

# Fetch the perfectly formatted CSV directly from the API
df = pd.read_csv("https://your-pos-url.com/api/export", headers={"Authorization": "Bearer YOUR_SECRET"})

# Ready for scikit-learn or forecasting!
print(df.head())
```
