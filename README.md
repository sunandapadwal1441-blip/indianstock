# Indian Stock Research Analyzer (v1.0)

A local JavaScript dashboard with two independent engines:
- Value Stock Analyzer: Graham Number, simplified Lynch fair value, weighted available valuation cross-checks, four score inputs and risk gates.
- Growth Stock Valuation Engine (GSVE): five pillars, 100-point normalized score, price zones, risk flags and bear/base/bull one-year scenario projections.

## Run locally

1. Install Node.js 18 or later.
2. Extract this folder.
3. Open a terminal in this folder and run:

   ```bash
   npm install
   npm start
   ```
4. Open http://localhost:3000

## Screener.in workflow

1. Enter a company name or NSE symbol and click **Search on Screener.in**.
2. Select the correct company in the Screener tab.
3. Copy the company page URL (for example `https://www.screener.in/company/TCS/`) into the app and click **Fetch public data**.
4. The app attempts to retrieve the publicly visible page and preserve its raw tables/ratio fields for review.
5. Verify and enter the required values into the analysis form. The current version does not automatically map every historical financial statement row into all scoring inputs.

Screener.in does not provide an official public developer API. The importer is best-effort, may fail if the site blocks automated requests or changes its page markup, and does not bypass login/paywalls or access controls. Respect Screener.in's current terms and robots.txt. Use Screener's own CSV export or manually entered data when appropriate. Never store or paste your Screener password/session cookies into this app.

## Data units and scoring

- Percentages are entered as percentage numbers (e.g. 18 means 18%).
- Monetary figures for cash flow/net profit are entered in ₹ crore.
- `debtToEquity` is a ratio (e.g. 0.5), not a percentage.
- Blank inputs remain unavailable. Scores are normalized to the available pillar maximum; always inspect missing fields and confidence.
- Qualitative inputs (market leadership, governance, capital allocation, etc.) require your own evidence-based assessment.
- Growth fair value is an input after reviewing valuation methods. The app does not pretend to derive a full DCF from incomplete inputs.
- Scenario target = forward EPS × (1 + scenario EPS growth) × scenario forward P/E. This is a one-year simplified scenario, not a forecast guarantee.
- The Value engine uses a simple equal average of valid valuation methods in v1.0. Industry-specific weighting and banking/NBFC/REIT-specific valuation modules are future enhancements; do not apply Graham Number blindly to banks, NBFCs, insurers or REITs.

## API

`POST /api/analyze` with `{ "engine": "growth"|"value", "data": { ... } }` returns JSON.

`GET /api/screener?url=https%3A%2F%2Fwww.screener.in%2Fcompany%2FTCS%2F` attempts a public page import.

## Important limitations

This is a v1.0 research prototype, not a broker terminal or a SEBI-registered advisory product. It does not fetch live quotes, analyst consensus or licensed forward estimates. Do not use illustrative sample values as real company data. Validate all figures against filings and company disclosures before making investment decisions.
