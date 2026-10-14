# 0010. Money as Decimal INR, area in sq.ft
- Status: Accepted, 2026-10-07
## Decision
Money is stored as `Decimal(14,2)` INR, calculated with `Prisma.Decimal` on the server, and sent in JSON as a string. Area is stored as `Decimal(12,2)` sq.ft (canonical) and converted for display to cents, grounds (2,400 sq.ft), acres, or sq.m in shared utils. Display uses en-IN grouping (lakh/crore).
## Consequences
+ No floating-point drift in receipts, outstanding balances, or commissions.
- The frontend must not do arithmetic on money strings except through shared helpers.
