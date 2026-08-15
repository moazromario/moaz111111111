# ARCHITECTURE CONTRACT & GOVERNANCE SPECIFICATION

**Project:** El-Naggar Furniture Manufacturing ERP (Smart Factory ERP)  
**Version:** 2.0.0-MODERNIZATION  
**Status:** BINDING ARCHITECTURAL CONTRACT  

> **CORE PRINCIPLE**: This is a **modernization project, NOT a rewrite**. All existing UI and business features must remain functional throughout the migration. Legacy code may temporarily co-exist during migration and must NOT be deleted until its migrated replacement passes all tests.

---

## MANDATORY ARCHITECTURAL FLOW RULE

> **STRICT DIRECTIVE**: No React UI component may directly implement complex business transactions, direct Firestore writes across multiple collections, or inline calculation engines.

All modernized code paths **MUST** strictly follow this linear layer flow:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. UI Component (React 19 View / Form / Table)                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Invokes UI action
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. Custom React Hook (e.g. useWorkOrders, useInventory, useTreasury)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Manages UI state, calls service
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. Application Service (e.g. WorkOrderAppService, InventoryAppService)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Coordinates orchestration & transactions
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. Domain Logic (Pure TS, e.g. costEngine, stockValidation)             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Executes pure business math & rules
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. Repository (e.g. WorkOrderRepository, InventoryRepository)           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Encapsulates database calls
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  6. Database (Firestore Atomic Transactions / Batches)                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. CURRENT ARCHITECTURE
- **Monolithic State & View Layer**: Monolithic `App.tsx` (21,440+ LOC) hosting 35+ top-level `useState` hooks and 35+ realtime `onSnapshot` subscriptions loading unpaginated collections into browser memory.
- **Direct Database Coupling**: React UI components directly execute multi-step `addDoc` and `updateDoc` calls inline inside event handlers without isolation or domain abstraction.
- **Backend Proxy**: Express Node.js backend (`server.ts`) running on port 3000, hosting Google Gemini AI endpoints (`@google/genai`) and handling Vite SSR/Dev middleware.
- **Mixed Authentication**: Hybrid custom `localStorage` plaintext authentication alongside Google OAuth / Firebase Auth SDK.
- **Unrestricted Database Rules**: Global wildcard rule `allow read, write: if true;` active on line 101 of `firestore.rules`.

---

## 2. TARGET ARCHITECTURE
- **Modular Domain Architecture**: Isolated domain modules (`/src/domain/[domain]`) separated cleanly from presentation components.
- **Decoupled Data Flow**: UI components consume custom hooks; custom hooks delegate business operations to Application Services; Application Services apply Domain Logic and commit updates via Repositories using atomic transactions.
- **Demand-Driven Paginated Data Fetching**: Realtime subscriptions replaced with paginated, windowed, and filtered Firestore queries (`limit(50)`).
- **Secured API & Auth Layer**: Unified Firebase Authentication (Email/Password & Google OAuth). Express API routes guarded by Firebase Auth ID Token verification middleware.
- **Strict Role-Based Security Rules**: Every collection protected in `firestore.rules` requiring `request.auth != null` and role claim checks.
- **Immutable Financial & Audit Ledgers**: Double-entry journal vouchers (`journalEntries`) and system audit logs (`auditLogs`) guaranteeing immutable financial auditability.

---

## 3. DOMAIN BOUNDARIES
Cross-domain mutations **MUST ONLY** occur via Application Service orchestrators or Repository atomic transactions.

1. **WorkOrders & Production Domain**:
   - *Responsibilities*: Furniture work orders, room specs, production stages, work centers, QC inspections, BOM rollups.
   - *Boundaries*: Does not directly mutate stock or safes; delegates material deductions to Inventory Service and expense logs to Treasury Service.
2. **Inventory & Warehouse Domain**:
   - *Responsibilities*: Raw materials, manufactured items, warehouse balances, issuances, warehouse transfers, stock audits.
   - *Boundaries*: Manages item balances via `FieldValue.increment()`. Does not touch sales invoices or cash safes directly.
3. **Treasury & Cash Safes Domain**:
   - *Responsibilities*: Cash safes, bank accounts, cash deposits, expenses, employee custodies, custody settlements.
   - *Boundaries*: All cash balance adjustments must produce an immutable `safeTransaction` log inside an atomic transaction.
4. **Purchasing & Supplier Domain**:
   - *Responsibilities*: Supplier directory, purchase invoices, material receipts, supplier payments and debt balances.
   - *Boundaries*: Purchasing updates raw material stock and supplier ledgers atomically.
5. **Sales & Customer Domain**:
   - *Responsibilities*: Customer directory, sales orders, deposits, customer debt ledgers, showroom inventory, delivery receipts.
6. **HR & Payroll Domain**:
   - *Responsibilities*: Employees, attendance, piece-rate production logs, bonuses/deductions, employee loans, payroll generation.
7. **Accounting & General Ledger Domain**:
   - *Responsibilities*: Chart of Accounts, double-entry journal vouchers, cost accounting engine, trial balance, financial statements.

---

## 4. FOLDER STRUCTURE
All modernized code must adhere to the following domain-driven layout:

```
/
├── docs/                         # Architecture contract & documentation
│   └── ARCHITECTURE.md           # This binding document
├── components/                   # Global shared UI design system (shadcn/ui primitives)
│   └── ui/                       # Base components (button, card, dialog, input, etc.)
├── src/
│   ├── assets/                   # Static branding images & logos
│   ├── components/               # Presentation UI components by domain
│   │   ├── WorkOrders/           # Work order UI views & forms
│   │   ├── Inventory/            # Inventory UI views
│   │   ├── Treasury/             # Cash safe UI views
│   │   └── [Domain]/             # HR, Sales, Purchasing UI views
│   ├── domain/                   # PURE BUSINESS LOGIC & APPLICATION SERVICES
│   │   ├── workOrders/           # Work order domain logic, services, & repositories
│   │   ├── inventory/            # Inventory domain logic & repositories
│   │   ├── treasury/             # Treasury domain logic & repositories
│   │   ├── accounting/           # Accounting engine & double-entry logic
│   │   ├── payroll/              # Payroll & piece-rate logic
│   │   └── [domain]/             # Other bounded domain logic
│   ├── hooks/                    # Custom React hooks bridging UI to Application Services
│   ├── lib/                      # Infrastructure & system utilities (firebase, costEngine)
│   ├── services/                 # Cross-domain integration services & AI API proxies
│   ├── types/                    # Domain-driven TypeScript models & Zod schemas
│   │   └── index.ts              # Unified type exports
│   ├── App.tsx                   # Main App Shell (Legacy routing/state)
│   ├── AuthContext.tsx           # Auth Context & Provider
│   ├── main.tsx                  # React DOM Entry
│   └── index.css                 # Global Tailwind CSS
├── firestore.rules               # Firestore Security Rules
├── server.ts                     # Express Server & Gemini API proxy
└── package.json                  # Workspace dependencies
```

---

## 5. SERVICE LAYER RULES
1. **Application Services Orchestrate**:
   - Application Services (e.g., `WorkOrderAppService`, `InventoryAppService`) coordinate workflows, validate rules, invoke domain math, and call Repositories.
2. **No UI Imports**:
   - Service layer files **MUST NOT** import React, JSX, or presentation components.
3. **Atomic Commit Coordination**:
   - Services prepare multi-document write operations and pass them to Repositories to execute as atomic Firestore transactions or batches.
4. **Pure Function Integration**:
   - Services delegate all mathematical computations (e.g., cost calculations, piece-rate sums, tax/margin calculations) to pure Domain Logic modules.

---

## 6. REPOSITORY LAYER RULES
1. **Database Encapsulation**:
   - Repositories (e.g., `WorkOrderRepository`, `InventoryRepository`) are the ONLY layer permitted to directly execute Firestore SDK calls (`getDoc`, `getDocs`, `runTransaction`, `writeBatch`, `onSnapshot`).
2. **Interface Abstraction**:
   - Each Repository must implement a clear TypeScript interface (e.g., `IInventoryRepository`).
3. **No Business Logic**:
   - Repositories must never perform business calculations or decision logic; they strictly read, format, and write data.
4. **Data Normalization**:
   - Repositories map raw Firestore document snapshots into validated TypeScript models before returning to Services.

---

## 7. VALIDATION LAYER
1. **Zod Schema Standard**:
   - All domain input data (forms, API payloads, imported files) **MUST** be validated using Zod schemas before hitting Application Services.
2. **Runtime Fail-Fast**:
   - Invalid payloads must fail fast at the boundary with clear error structures.
3. **Dual-Layer Validation**:
   - Client-side validation prevents invalid UI submits. Express API endpoints re-validate incoming payloads with Zod middleware.

---

## 8. AUTHENTICATION RULES
1. **Unified Firebase Auth**:
   - All users must authenticate via Firebase Authentication (Email/Password or Google OAuth).
2. **Deprecation of Plaintext Credentials**:
   - Storing plaintext passwords in Firestore `users` documents or browser `localStorage` is strictly prohibited.
3. **Token Propagation**:
   - Authenticated client requests to Express API endpoints (`/api/*`) MUST include the Firebase Auth ID Token in the `Authorization: Bearer <token>` header.

---

## 9. AUTHORIZATION RULES
1. **Role-Based Access Control (RBAC)**:
   - System access permissions are governed by role claims (`admin`, `manager`, `accountant`, `warehouse`, `worker`).
2. **Server-Enforced Authorization**:
   - UI navigation hiding is for user convenience only. True authorization checks MUST be enforced by Firestore Security Rules and Express middleware.
3. **Context Profile Protection**:
   - Profile state in `AuthContext` must be immutable from client-side console manipulation.

---

## 10. FIRESTORE ACCESS RULES
1. **No Wildcard Open Access**:
   - Wildcard rule `allow read, write: if true;` is strictly forbidden in production.
2. **Authenticated Access Mandatory**:
   - Every collection rule in `firestore.rules` must enforce `request.auth != null`.
3. **Field-Level Guards**:
   - Security rules must validate that critical balance fields (`items.currentBalance`, `safes.balance`) cannot be overwritten arbitrarily without proper role permissions.

---

## 11. TRANSACTION RULES
1. **Multi-Doc Atomic Writes**:
   - Any operation mutating 2 or more documents (e.g., Purchase = Stock Inward + Supplier Ledger + Safe Expense) **MUST** execute inside `runTransaction` or `writeBatch`.
2. **Atomic Balance Deltas**:
   - Balance updates must use `FieldValue.increment(delta)` inside transactions rather than setting absolute pre-calculated numbers.
3. **Transaction Rollback Safety**:
   - If any step in a multi-doc write fails, the entire transaction must abort, ensuring zero partial updates.

---

## 12. AUDIT LOGGING RULES
1. **Immutable Audit Trail**:
   - High-impact business actions (deletions, financial disbursements, manual inventory overrides, salary releases) MUST write an immutable record to the `auditLogs` collection.
2. **Audit Record Schema**:
   - `id`: Auto-generated UUID / Firestore ID
   - `userId`: String (Firebase Auth UID)
   - `userEmail`: String
   - `action`: String (e.g., `DELETE_WORK_ORDER`, `ADJUST_STOCK`)
   - `collectionName`: String
   - `documentId`: String
   - `timestamp`: ISO String
   - `metadata`: Record<string, any> (Before/After snapshot)

---

## 13. ERROR HANDLING
1. **Structured Error Classes**:
   - Domain errors must inherit from a base `AppError` class containing `code`, `message`, and `httpStatus`.
2. **User-Facing Arabic Notifications**:
   - UI toast alerts must show clean, professional Arabic messages without exposing raw database stack traces or technical error codes to factory floor operators.
3. **Express Error Handling**:
   - All Express route handlers must catch errors and return consistent JSON error objects: `{ success: false, error: string, details?: any }`.

---

## 14. NAMING CONVENTIONS
1. **Files & Directories**:
   - React Components: `PascalCase.tsx` (e.g., `WorkOrderCosts.tsx`)
   - Domain Services & Repositories: `camelCase.ts` (e.g., `inventoryAppService.ts`)
   - Custom Hooks: `useCamelCase.ts` (e.g., `useWorkOrders.ts`)
   - Types & Interfaces: `PascalCase.ts` or `index.ts`
2. **Code Symbols**:
   - Interfaces: `PascalCase` (e.g., `FurnitureWorkOrder`, `IInventoryRepository`)
   - Functions & Variables: `camelCase` (e.g., `calculateJobCost`, `totalAmount`)
   - Firestore Collections: `camelCase` plural (e.g., `furnitureWorkOrders`, `safeTransactions`)

---

## 15. TYPESCRIPT CONVENTIONS
1. **Strict Type Safety**:
   - `any` type is strictly forbidden in new/migrated code.
2. **Standard Enums / String Unions**:
   - Use standard `enum` or explicit string unions (e.g., `type WorkOrderStatus = 'جديد' | 'قيد التنفيذ' | 'مكتمل'`). `const enum` is forbidden.
3. **Top-Level Imports**:
   - All `import` statements must be placed at the very top of the file. No inline `require()` or dynamic imports inside functions unless code-splitting routes.

---

## 16. REACT COMPONENT CONVENTIONS
1. **Functional Components Only**:
   - Use React 19 functional components with custom hooks.
2. **Component Size & Modularity**:
   - No new or refactored component file may exceed 400 lines of code. Split complex components into modular sub-components.
3. **State Isolation**:
   - UI state (modals, dropdowns, form inputs) remains local. Business state is managed via Custom Hooks and React Contexts.
4. **Render Performance**:
   - Memoize expensive calculations with `useMemo`. Wrap callbacks in `useCallback` when passing to virtualized lists or child components.

---

## 17. TESTING CONVENTIONS
1. **Compilation Guard**:
   - `npm run lint` (`tsc --noEmit`) must compile with ZERO errors before completing any task.
   - `compile_applet` must build successfully.
2. **Cost Calculation Parity**:
   - Modernized job costing routines must be validated against `getJobLedgerCostBreakdown()` to guarantee 100% mathematical parity.
3. **Transaction Rollback Testing**:
   - Repository write transactions must be tested with simulated network errors to verify full atomic rollback.

---

## 18. MIGRATION CONVENTIONS
1. **Coexistence of Legacy & Modernized Code**:
   - Legacy code paths in `App.tsx` and legacy components may remain active while new domain services and repositories are introduced in parallel.
2. **No Behavioral Changes During Migration**:
   - Modernization steps must preserve existing application workflows, UI layouts, and business features.
3. **Safe Deprecation**:
   - Legacy code must NOT be removed until the replacement domain service and repository are fully tested and verified.

---

## 19. BACKWARD COMPATIBILITY RULES
1. **Database Schema Continuity**:
   - Existing collection names, document IDs, and field names MUST NOT be deleted or renamed.
2. **Optional New Fields**:
   - Any new property added to existing models must be marked optional (`?`) with fallback default values during data reading.
3. **Client Fallbacks**:
   - Reader logic must handle legacy document formats gracefully without throwing runtime errors.

---

## 20. DEFINITION OF DONE
A modernization step or feature is considered **DONE** only when:
1. All code adheres to the mandatory layer flow: `UI → Hook → Application Service → Domain Logic → Repository → Firestore`.
2. No React component directly executes multi-collection database mutations or raw complex business logic.
3. All TypeScript types are strictly declared (zero `any`).
4. `npm run lint` (`tsc --noEmit`) passes with ZERO errors.
5. `compile_applet` completes successfully.
6. Existing UI behavior and business features function without regression.
7. Architectural contract in `docs/ARCHITECTURE.md` is fully respected.

---

## SAFE TO IMPLEMENT NOW
- Creating domain service interfaces and repositories inside `/src/domain/`
- Writing Zod validation schemas for forms and API routes
- Extracting UI sub-components out of large files into modular component files
- Adding Firebase Auth token middleware to Express routes in `server.ts`
- Adding non-breaking audit logging helpers (`logAuditEvent`)

## DO NOT TOUCH YET
- 🛑 Deleting or altering existing collection names in Firestore
- 🛑 Removing legacy code paths in `App.tsx` before replacements are fully tested
- 🛑 Modifying Firestore Rules wildcard line until Firebase Auth migration is complete
- 🛑 Exposing secret API keys to client-side environment variables
