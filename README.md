# NADLE v8

12 public family-outing destinations. National Agriculture Museum public same-day availability parser retained from v7; Suwon Museum **official page connectivity diagnostic only**. No fabricated live seats.

## Deploy
Push `index.html` and `api/` to a GitHub repository root and import it into Vercel as an Other project. Visit the deployment and test `/api/availability?date=YYYY-MM-DD` (today in Korea), `/api/suwon-status`. Browser-opening `index.html` alone cannot run server functions.

## Important
The current runtime could not connect to the official websites to verify deployed scraping. A successful HTTP check is not evidence of reservation availability. Confirm all reservations with the official website. No login bypass or unofficial private API is used.
