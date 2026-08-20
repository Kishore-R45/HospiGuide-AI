# HospiGuide AI — Complete Project Specification
### AI-Powered Indoor Navigation and Intelligent Patient Guidance Framework for Government Hospitals using Hybrid Indoor Localization

> **Purpose of this document:** This is the single source of truth for the HospiGuide AI project. It is written to be fed to GitHub Copilot / any AI coding assistant as context so that generated code stays consistent with the architecture, data model, and UX decisions below. Every module, screen, and integration is specified in enough detail to implement without further clarification. Where a real-world constraint exists (e.g., browser API limitations), it is called out explicitly rather than glossed over — build around these constraints from day one instead of discovering them late.

---

## Table of Contents
1. Project Identity & Scope
2. Problem Statement & Objectives
3. System Architecture
4. Technology Stack (with rationale)
5. Repository Structure
6. **Data Strategy** — what data you actually need and how to get it without hospital access
7. **Building the Indoor Digital Map** (Google-Maps-like)
8. **BLE Beacon Deployment** — coin-cell tags, configuration, and phone integration
9. Hybrid Indoor Localization Engine
10. Navigation & Routing Engine
11. AI Patient Assistant (Symptom → Department)
12. Voice Assistant (Tamil + English)
13. Frontend — Screen-by-Screen UI/UX Specification
14. Backend API Design
15. Database Schema
16. Real-World Platform Constraints (read before coding)
17. Security & Privacy
18. Testing & Evaluation Metrics (for your IEEE paper)
19. Development Roadmap / Build Order
20. Instructions for GitHub Copilot

---

## 1. Project Identity & Scope

**Name:** HospiGuide AI
**Full Title:** AI-Powered Indoor Navigation and Intelligent Patient Guidance Framework for Government Hospitals using Hybrid Indoor Localization

**What it is:** A smartphone-based **web application** (not a native app). A patient scans a QR code at the hospital entrance, the React PWA opens instantly in the browser — no install, no app store friction. The app figures out where the patient needs to go (via symptom or direct request), localizes them inside the building using a hybrid of phone sensors + BLE beacons, and walks them there turn-by-turn like Google Maps, with voice guidance in Tamil or English.

**Deployment reality:** Target is a large government hospital (e.g., Rajiv Gandhi Government General Hospital, Chennai). Since real hospital data/access is not available for a student project, the **college campus is the prototype environment**, with a direct semantic mapping so the architecture transfers 1:1 to a real hospital later:

| College (Prototype) | Hospital (Production) |
|---|---|
| Library | Pharmacy |
| College Office | Registration Counter |
| Seminar Hall | Outpatient Department (OPD) |
| Laboratory | Diagnostic Lab |
| Classroom | Ward |
| Canteen | Cafeteria |

Build every module so that swapping the `locations`, `departments`, `doctors` tables and the map image is the **only** change needed to go from campus → hospital. Don't hardcode "Library" anywhere in logic — always reference `category` (e.g., `PHARMACY`), not the campus-specific label.

---

## 2. Problem Statement & Objectives

Large government hospitals have multiple blocks, floors, departments, and specialty clinics. First-time patients waste significant time finding the right place; GPS doesn't work indoors; staff time is consumed giving directions repeatedly.

**Objectives the system must satisfy:**
- Real-time indoor navigation, accurate to a few meters
- Symptom → department recommendation (not diagnosis)
- Doctor availability lookup
- Tamil + English support (voice and text)
- Continuous indoor position tracking
- Dynamic route recalculation on deviation
- Landmark-based, human-readable directions ("turn left at the pharmacy counter", not raw coordinates)

---

## 3. System Architecture

```mermaid
flowchart TD
    A[Patient scans QR at entrance] --> B[React PWA loads]
    B --> C[Language selection: TA / EN]
    C --> D[Permission requests: Bluetooth, Mic, Motion sensors]
    D --> E[AI Assistant: voice or text]
    E -->|"I have eye pain" or "Take me to Pharmacy"| F[Gemini Recommendation Engine]
    F --> G[Department + Doctor + Room resolved]
    G --> H[Navigation Engine: A* pathfinding]
    H --> I[Localization Engine: PDR + BLE fusion]
    I --> J[Live turn-by-turn UI + Voice guidance]
    J -->|deviation detected| H
    J --> K[Arrival confirmation]

    subgraph Backend [Node.js Backend]
        L[REST APIs]
        M[WebSocket - live position broadcast]
        N[PostgreSQL]
    end

    H <--> L
    I <--> M
    F <--> L
    L <--> N
```

**Layer responsibilities:**
- **Frontend (React PWA):** all UI, sensor access, BLE scanning, on-device PDR computation, rendering the map, voice I/O. Position is computed **client-side** for low latency, then synced to backend for logging/analytics via WebSocket.
- **Backend (Node.js):** source of truth for map graph, departments, doctors; computes/validates shortest paths (A*); stores anonymized session analytics; proxies Gemini API calls (never call Gemini directly from the browser — keep the API key server-side).
- **Database (PostgreSQL):** graph data, department/doctor data, beacon registry.
- **AI (Gemini Flash API):** symptom classification, conversational assistant, called through your backend, not the browser.

---

## 4. Technology Stack (with rationale)

### Frontend
| Tech | Why |
|---|---|
| React 18 + TypeScript + Vite | Fast dev loop, type safety for a graph-heavy, sensor-heavy codebase where bugs are expensive |
| Tailwind CSS | Rapid, consistent styling; pairs well with a design-token approach (see §13) |
| **Leaflet.js + react-leaflet** (primary map renderer) | Leaflet supports `L.CRS.Simple` — a coordinate system with **no real-world GPS**, just plain X/Y pixels over an image. This is exactly how professional indoor-mapping products (Mappedin, IndoorAtlas) render floor plans, and it gives you Google-Maps-style pan/zoom/pinch/markers/polylines for free. This is a stronger choice than raw SVG for a "feels like Google Maps" requirement — recommended over React Konva as the primary map layer. |
| React Konva (secondary/optional) | Only if you need highly custom drawn map art (icons, animated route "walking" dots) layered on top of Leaflet — use as an overlay, not a replacement |
| Zustand | Lightweight global state (user position, active route, language) — simpler than Redux for this scope |
| TanStack Query (React Query) | Server state (departments, doctors, map data) with caching |
| Web Speech API (`SpeechRecognition` / `SpeechSynthesis`) | Free, on-device voice I/O — see §16 for browser support caveats |
| Web Bluetooth API | BLE beacon scanning — see §16 for the critical iOS limitation |
| `DeviceMotionEvent` / `DeviceOrientationEvent` | Accelerometer/gyroscope/magnetometer access for PDR |
| Workbox (PWA) | Offline shell caching so the map still loads with poor hospital WiFi |

### Backend
| Tech | Why |
|---|---|
| Express / Fastify + Prisma/pg | Node.js ecosystem; clean REST + ORM mapping |
| PostgreSQL + **PostGIS-style flat X/Y** (not real geo) | You don't need geographic SRID — store plain float X/Y in meters relative to a building origin. Simpler, faster, and matches Leaflet's Simple CRS |
| Socket.io (Node.js) | Live position broadcast if you want a "family member tracking a patient" feature later, and for real-time analytics |
| Express Middleware + JWT (lightweight) | Only needed for the admin panel (see §13.9), not for anonymous patient sessions |

### AI
- **Gemini 1.5/2.0 Flash API**, called from Node.js backend, using **structured output (JSON mode / function calling)** so the model returns `{ "department": "OPHTHALMOLOGY", "confidence": 0.92, "urgency": "routine" }` instead of free text you have to parse. This is far more reliable for a production flow than prompting for prose and regex-parsing it.

### Algorithms
- **A\*** for shortest path (Euclidean heuristic on X/Y graph)
- Deviation detection: if live position strays more than *N* meters from the planned polyline for more than *T* seconds, trigger recalculation
- **Sensor fusion:** Extended Kalman Filter (EKF) or a simpler weighted complementary filter blending PDR heading/step estimate with BLE-beacon proximity correction (full detail in §9)

---

## 5. Repository Structure

```
hospiguide-ai/
├── frontend/
│   ├── src/
│   │   ├── app/                  # routing, providers
│   │   ├── features/
│   │   │   ├── onboarding/       # QR landing, language, permissions
│   │   │   ├── assistant/        # chat + voice UI, Gemini integration
│   │   │   ├── map/              # Leaflet map, floor switcher, markers
│   │   │   ├── navigation/       # turn-by-turn, route state
│   │   │   ├── localization/     # PDR engine, BLE scanner, fusion
│   │   │   └── admin/            # map/doctor data management (staff-only)
│   │   ├── shared/
│   │   │   ├── components/       # design-system primitives
│   │   │   ├── i18n/             # ta.json, en.json
│   │   │   └── api/              # typed API client
│   │   └── main.tsx
│   └── public/
│       └── maps/                 # floor plan images (floor-1.png, floor-2.png...)
├── backend/
│   ├── src/
│   │   ├── controllers/          # Route handlers (departments, doctors, locations, etc.)
│   │   ├── routes/               # Express routes definition
│   │   ├── services/             # A* pathfinding, Gemini proxy, graph logic
│   │   ├── models/               # Prisma/pg database models
│   │   ├── websocket/            # Live position config (Socket.io)
│   │   └── index.js              # Node.js entry point
│   ├── .env                      # Environment variables
├── data/
│   ├── seed/                     # CSV/JSON seed data — see §6
│   └── map-source/                # original floor plan traces (Figma/SVG exports)
└── docs/
    └── HospiGuide_AI_SPEC.md      # this file
```

---

## 6. Data Strategy — What You Actually Need, and How to Get It Without Hospital Access

You correctly identified this as the real blocker. Here's how to solve each data category honestly and defensibly for a final-year/IEEE submission — reviewers expect a "Limitations" section acknowledging simulated data; they penalize *pretending* it's real, not disclosing that it's simulated.

### 6.1 Indoor Map Data (floor plans, coordinates)
You need a 2D floor plan and a coordinate for every important location. Since it's your own campus:
1. **Get the official building layout** if it exists — ask your college admin/estate office for an existing blueprint or fire-safety evacuation map (most colleges have one; it's usually just given on request, no "permission process" needed).
2. If unavailable, **survey it yourself**: walk each floor with a phone compass app + pace counting, or a cheap laser distance meter (~₹500–1000), and sketch corridors, rooms, stairs, lifts to rough scale on graph paper.
3. **Digitize it**: trace the sketch/blueprint in **Figma** (free, and exports clean SVG/PNG) or **draw.io** — draw corridors as simple polylines and rooms as rectangles, label each with its category. Export each floor as a PNG image at a known pixel scale (e.g., 1 pixel = 5 cm) — this image becomes your Leaflet Simple-CRS base layer.
4. **Assign node coordinates** directly by reading X/Y pixel positions off the image for each entrance, junction, and room — no GPS or survey-grade equipment needed at all.

### 6.2 Department & Doctor Data
You cannot get real hospital doctor rosters, and you shouldn't try. Instead:
- Use **publicly published, non-personal information** as your structural template: most government hospitals publish their department list and general OPD timings on their public website or the state health department portal. This tells you realistic department names, typical room-numbering conventions, and OPD hours — it's public institutional information, not patient/personal data, so it's safe to reference for structure.
- **Generate synthetic doctor records**: realistic-sounding placeholder names, mapped to the real department structure above, with plausible room numbers and availability windows. Store a `is_simulated: true` flag in the `doctors` table and state clearly in your report: *"Doctor data is synthetically generated for demonstration; a production deployment requires hospital administrative onboarding of real staff data."* This is standard, expected academic practice — it strengthens your paper rather than weakening it.
- For the **campus prototype demo**, you can go one step further and use real (but non-sensitive) campus data — actual faculty names/cabin numbers with their consent — to make the live demo feel authentic, separate from the hospital-mapped synthetic dataset.

### 6.3 Symptom → Department Mapping
This is general medical knowledge, not patient data, so it's freely usable:
- Compile a reference list of common symptoms → medical specialty (e.g., "chest pain" → Cardiology, "blurred vision" → Ophthalmology) from public sources like hospital website symptom-checkers or general medical triage references.
- Feed this list to Gemini as **system-prompt context** ("grounding"), so the model classifies against *your* department list rather than inventing specialties you don't have. This also lets you constrain outputs to your actual `departments` table via function calling.
- **Guardrail (important):** the system prompt must explicitly instruct the model to never diagnose, never suggest medication, and to always add "please consult the doctor for confirmation" — and your UI should never phrase output as a diagnosis. This matters both ethically and for your paper's discussion of AI safety.

### 6.4 BLE Beacon Data
This one you generate yourself as you deploy (see §8) — record each beacon's UUID/Major/Minor and its physical X/Y placement into the `BLE_Beacons` table as you install them.

---

## 7. Building the Indoor Digital Map (Google-Maps-like)

**Goal:** a map that pans, zooms, shows a live blue-dot position, and draws a highlighted route — the core Google Maps navigation *feel* — without needing real GPS coordinates.

### 7.1 Recommended approach: Leaflet with `L.CRS.Simple`
1. Export each floor as a flat image (PNG/SVG) from Figma/draw.io as described in §6.1.
2. In Leaflet, use `L.CRS.Simple` and `L.imageOverlay()` to place that image as the map's only "tile layer" — Leaflet then treats image pixel coordinates as your map coordinates. No real-world lat/lng, no map tile server, no cost.
3. Layer on top of the image:
   - `L.marker()` for the live user position (custom blue-dot + direction-cone icon, rotated to match heading — exactly like Google Maps)
   - `L.polyline()` for the computed route, styled with your accent color
   - `L.marker()` for department/POI pins with category icons (pharmacy cross, lift icon, restroom icon, etc.)
4. **Multi-floor support:** each floor is a separate image + separate node set in the graph (with `floor` field). Add a floor switcher control (styled like a vertical pill selector, top-right of the map) that swaps the active `imageOverlay` and re-centers. Lifts/staircases are graph nodes present on *two* floors, connected by a special `VERTICAL` edge type with an extra time-cost weight (waiting for the lift).
5. **Polish that makes it feel production-grade:**
   - Smooth marker movement: animate position updates with a short CSS/JS transition rather than snapping, so the blue dot glides.
   - Auto-rotate map to heading-up mode during active navigation (optional toggle), like Google Maps walking mode.
   - Recenter/"my location" floating action button.
   - Route line uses a subtle pulsing/dashed animation in the direction of travel.

### 7.2 Alternative for hand-drawn/stylized maps
If you want a more illustrated, less blueprint-y look, draw floor plans directly as SVG in Figma with custom iconography, and use **React Konva** to render nodes/routes as interactive canvas objects instead of Leaflet. This gives more visual control but you lose Leaflet's built-in pan/zoom/gesture handling and have to build it yourself — only choose this path if visual customization matters more than dev speed.

---

## 8. BLE Beacon Deployment (Coin-Cell Tags)

### 8.1 Hardware
Coin-cell BLE beacon tags (generic iBeacon-compatible, e.g., "iBeacon Mini" style tags widely available on AliExpress/Amazon for ~₹200–400 each) are the right cheap choice. Look for ones that are:
- **iBeacon-format compatible** (broadcasts UUID + Major + Minor + TX power) — this format is the most broadly supported and simplest to parse.
- Configurable broadcast interval and TX power via a companion app (usually **nRF Connect** by Nordic Semiconductor, free on Android/iOS) — lower interval = more frequent updates but faster battery drain; ~500ms–1s interval is a reasonable balance for a coin-cell beacon (expect 6–12 months battery life at that setting).

### 8.2 Configuration
1. Install **nRF Connect for Mobile**.
2. Scan and connect to each beacon; most cheap tags expose a config characteristic to set:
   - **UUID**: keep the same UUID for *all* your beacons (identifies "this is a HospiGuide beacon") — e.g. generate one UUID once for the whole deployment.
   - **Major**: use this to encode the *floor* (Major = 1 for floor 1, 2 for floor 2, etc.)
   - **Minor**: use this to encode the *specific beacon/node ID* on that floor.
   - **TX Power**: calibrate at 1 meter distance per beacon (nRF Connect can help measure this) — needed for RSSI-to-distance estimation.
3. Record each beacon's `uuid/major/minor` plus its physical placement X/Y into your `BLE_Beacons` table (§15) — this mapping is what lets the app say "you are near Node 14" when it sees Major=1, Minor=14.

### 8.3 Placement Strategy
Don't try to blanket the building — with cheap sparse beacons, **place them only at decision points**, exactly as in your original plan:
- Entrance, every lift, every staircase landing, major corridor intersections, and key department entry points.
- Space them so their effective ranges don't overlap excessively (typical usable indoor range ~8–15 m depending on walls) — you want each "zone" fairly distinguishable, not a dense mesh.
- With sparse placement, **don't attempt full trilateration** (needs 3+ simultaneous beacons in range, which sparse deployment won't reliably give you). Instead, use a **nearest-beacon zone-correction** approach: whenever a beacon's RSSI crosses a strong-signal threshold, snap/nudge the PDR-estimated position toward that beacon's known coordinate. This is simpler, cheaper to deploy, and works well in practice for corridor-based buildings — full detail in §9.

### 8.4 Phone Integration (Web Bluetooth)
```javascript
// Request and scan for HospiGuide beacons (Android Chrome only — see §16)
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['<your-custom-service-uuid-if-using-GATT>'] }],
  // For pure iBeacon advertisement scanning, Web Bluetooth's requestDevice()
  // requires a user gesture and a filter; continuous passive background
  // scanning of raw advertisements needs the origin trial /
  // `bluetooth.requestLEScan()` API (Chrome-only, experimental).
});
```
- Realistically, for a browser-based (not native) app, use the experimental `navigator.bluetooth.requestLEScan()` API (Chrome/Android only, must be served over HTTPS, requires a user-initiated permission prompt once). It gives you raw advertisement packets with UUID/Major/Minor/RSSI, which you then map against your `BLE_Beacons` table.
- **Smooth the RSSI signal** — raw RSSI is noisy. Apply a simple moving average or a 1-Euro filter over the last 5–10 readings before feeding it into the fusion engine.
- Convert RSSI to an approximate distance using the log-distance path-loss model as a rough proximity signal (it's noisy — treat it as "near/far", not precise metric distance):
  `distance ≈ 10 ^ ((TxPower - RSSI) / (10 * N))` where `N` is an environment factor (~2–4 for indoor hospital corridors, tune empirically).

---

## 9. Hybrid Indoor Localization Engine

**Core idea:** Pedestrian Dead Reckoning (PDR) gives continuous position but drifts over time. BLE beacons give occasional, absolute "you are near X" corrections. Fuse them.

### 9.1 Pedestrian Dead Reckoning (PDR)
Runs entirely client-side using `DeviceMotionEvent`:
1. **Step detection**: apply a peak-detection algorithm on the vertical acceleration signal (band-pass filtered) to count steps.
2. **Step length estimation**: use a simple model like the Weinberg algorithm (`step_length = K * (a_max - a_min)^0.25`) rather than a fixed constant — accounts for walking speed variation.
3. **Heading estimation**: fuse gyroscope (short-term accurate, drifts over time) with magnetometer (long-term stable, noisy near metal/electronics) via a complementary filter — standard approach, don't rely on magnetometer alone indoors (hospital equipment causes magnetic interference).
4. Each detected step advances the estimated position by `step_length` in the current heading direction.

### 9.2 Fusion with BLE corrections
- Maintain position as `(x, y, headingConfidence, positionConfidence)`.
- Every PDR step: `positionConfidence` decreases slightly (drift accumulates).
- Every strong BLE beacon detection (RSSI above a "near" threshold, e.g. > -65 dBm): pull the estimated position toward the beacon's known coordinate, weighted by signal strength — a simple weighted average is enough for a prototype (`newPos = α * beaconPos + (1-α) * pdrPos`, with α closer to 1 when RSSI is strong); a full Kalman/particle filter is a good "future work" upgrade for the paper but not required for a working demo.
- Reset `positionConfidence` to high on each correction.

### 9.3 Map matching
Snap the fused (x,y) estimate onto the nearest graph edge (corridor) rather than showing raw sensor noise — patients don't walk through walls, so constrain displayed position to plausible walkable paths. Simple perpendicular-distance-to-edge snapping is sufficient.

---

## 10. Navigation & Routing Engine

### 10.1 Graph model
- Every important location = a **node**: `{id, name, category, floor, x, y}`.
- Every walkable connection = an **edge**: `{fromNode, toNode, distanceMeters, type: CORRIDOR | LIFT | STAIRCASE}`, with `LIFT`/`STAIRCASE` edges carrying an extra fixed time-cost (waiting, walking up/down) beyond raw distance.

### 10.2 Pathfinding
- **A\*** with Euclidean distance heuristic (adjusted to 0 across floor changes, since heuristic must never overestimate).
- Edge weight = distance in meters, or optionally time-cost if you want to prefer lifts over stairs for accessibility mode (see §10.4).
- Recompute is cheap enough (small graph, few hundred nodes) to just re-run A* fully rather than incrementally repair the path.

### 10.3 Dynamic recalculation
- Continuously compare live fused position to the active route polyline.
- If perpendicular distance from the path exceeds a threshold (e.g., 5–8 m) for more than ~3 consecutive seconds → recompute A* from current position to the original destination, and smoothly transition the displayed route.
- Debounce this — don't recalculate on every single noisy reading.

### 10.4 Accessibility-aware routing
Add a routing preference flag (`avoidStairs: boolean`) that assigns a very high edge weight to `STAIRCASE` edges when true, so A* naturally prefers `LIFT` edges for wheelchair/mobility-impaired patients — small change, meaningful real-world impact, good discussion point for your paper.

### 10.5 Turn-by-turn instruction generation
Don't just say "go to node 14" — convert the path into human instructions:
1. For each edge transition, compute the turn angle between the incoming and outgoing edge direction.
2. Bucket the angle into instructions: `< 20°` = "Continue straight", `20°–150°` = "Turn left/right", `> 150°` = "Turn around".
3. Attach the nearest **landmark** (from the node's `landmark` field, e.g., "near the pharmacy counter") to make instructions Google-Maps-natural: *"Walk 20 meters, then turn left at the pharmacy counter."*
4. Localize this instruction text through the same i18n system as the rest of the UI (§13).

---

## 11. AI Patient Assistant (Symptom → Department)

**Flow:** patient describes symptom (voice or text) → backend calls Gemini with structured-output prompting → department + confidence + urgency returned → doctor + room resolved from DB → navigation offered.

### 11.1 Prompt design (backend-side, never expose the API key to the browser)
- System prompt includes: your actual `departments` list, the symptom-mapping reference (§6.3), explicit safety constraints, and a strict output schema (JSON mode / Gemini function calling) so the response is directly parseable — e.g. `{ department: string, confidence: number, urgency: "routine" | "prompt" | "emergency", clarifyingQuestion?: string }`.
- If confidence is low, the model should return a `clarifyingQuestion` instead of guessing — the UI then asks one follow-up before recommending, rather than silently guessing wrong and sending someone to the wrong department.
- **Hard safety rule embedded in the prompt:** the assistant recommends a department only — it must never name a disease, suggest medication, or give a clinical assessment. If a description sounds like a medical emergency (e.g., chest pain, severe bleeding, breathing difficulty), the response should immediately flag `urgency: "emergency"` and the UI should show an emergency-department shortcut prominently, bypassing the normal chat flow.

### 11.2 Conversation UI behavior
Keep the assistant conversational but tight — 1–2 exchanges maximum before resolving to a department, not an open-ended chatbot. Patients are often unwell or in a hurry; don't make them chat extensively.

---

## 12. Voice Assistant (Tamil + English)

- **Speech-to-text:** Web Speech API `SpeechRecognition`, with `lang` set to `'ta-IN'` or `'en-IN'` based on the selected language.
- **Text-to-speech:** Web Speech API `SpeechSynthesis` as the default (free, on-device) — **but** see §16 for a real gap: Tamil voice availability varies wildly by device/browser, and many Android devices have no installed Tamil TTS voice at all. Build a fallback: if `speechSynthesis.getVoices()` contains no Tamil voice, fall back to a cloud TTS call (e.g., Google Cloud Text-to-Speech, which has solid Tamil voices) proxied through your backend, and cache the generated audio clips for common navigation phrases (there's a small finite set: "turn left", "turn right", "continue straight", "you have arrived", etc.) so you're not paying per-request for repeated phrases.
- Voice guidance during navigation should be **event-triggered, not continuous** — speak only at decision points (upcoming turn, arrival), not a running commentary, to avoid being annoying/repetitive like some GPS apps are.

---

## 13. Frontend — Screen-by-Screen UI/UX Specification

**Design language:** should feel like a cross between Google Maps' navigation UI (bottom sheet, floating action buttons, clean map-first layout) and a calm, trustworthy healthcare app (soft rounded corners, generous whitespace, high-contrast accessible text — many users will be elderly or unwell). Mobile-first, single column, large tap targets (min 44px).

### 13.1 Splash / QR Landing Screen
- Opens the instant the QR code is scanned (URL has a hospital/kiosk ID param, e.g. `?entrance=main-block`).
- Shows HospiGuide AI logo/wordmark, a one-line tagline, and a brief 1–2 second loading state while checking sensor/browser capability.
- No login required — fully anonymous session, identified by a temporary session ID.

### 13.2 Language Selection
- Two large tap targets: "தமிழ்" and "English", each with a flag/icon and native-script label (don't make Tamil speakers read English to find the Tamil option).
- Selection persists for the whole session (stored in app state, not necessarily localStorage — see the artifact/browser-storage note if this logic ever lives in a Claude-generated artifact demo; in your real app localStorage is fine).

### 13.3 Permission Priming Screen
Before triggering the actual browser permission prompts, show a friendly **explanation screen first** — a plain "why we need this" screen with three rows (Bluetooth → "to sense nearby beacons and locate you accurately", Motion sensors → "to track your steps as you walk", Microphone → "so you can just speak instead of typing"), each with a simple icon, **before** the native OS permission dialogs fire. This dramatically improves grant rates versus surprising the user with browser prompts cold — this is standard UX practice worth explicitly building in, not an afterthought.

### 13.4 Assistant / Home Screen
- Chat-style interface, but bottom-anchored input bar with a large mic button (primary action) and a text field (secondary, for when the patient can't/won't speak).
- Above the input: a horizontal row of **quick-suggestion chips** for the most common needs (Registration, Pharmacy, Emergency, "I don't feel well") — most patients won't want to type/talk at all, they'll just tap.
- Assistant responses appear as chat bubbles; when a department is resolved, render a distinct **recommendation card** (not a plain bubble) showing: department name, recommended doctor + photo/avatar placeholder, room number, estimated walk time, and a prominent "Start Navigation" button.
- Emergency detection (§11.1) shows a persistent red "Emergency? Tap here" banner pinned above the input at all times, not just when triggered by the AI.

### 13.5 Map & Navigation Screen
- Full-screen map (Leaflet, §7), status bar overlay showing: current instruction ("Turn left in 10m"), distance remaining, ETA.
- Bottom sheet (swipe-up, Google-Maps-style) with the full step list, collapsible.
- Floating action buttons: recenter/"my location", voice-guidance mute toggle, floor switcher (if multi-floor route).
- Blue dot + heading cone for live position; highlighted polyline for the route; small icons for upcoming landmarks.
- If recalculating: brief non-blocking toast ("Recalculating route…") rather than a jarring full-screen loader.

### 13.6 Arrival Screen
- Simple confirmation: "You've arrived at Ophthalmology, Room 214" with a checkmark animation.
- Two actions: "Find another department" (returns to Assistant screen) or "Done".

### 13.7 Settings
- Language toggle, accessibility toggle (avoid stairs), voice guidance on/off, "About this project" (good place to note it's a prototype/research demo, for the campus deployment context).

### 13.8 Doctor Availability Screen (accessible from a chip or the recommendation card)
- List of doctors in a department, with name, room, and a live/simple "Available now / Available from 2:00 PM" status pulled from the `availability` field.

### 13.9 Admin Panel (separate, staff-only route, not exposed to patients)
- Simple authenticated CRUD screens for managing `locations`, `connections`, `departments`, `doctors`, `beacons` — this is what makes the "swap map for a real hospital later" claim actually true in practice, rather than requiring a database migration each time. Basic table + form UI is enough; doesn't need the same design polish as the patient-facing app.

### 13.10 Design tokens (starting point — adjust to taste)
- Primary accent: a calm medical blue or teal (avoid alarming reds except for the emergency banner).
- Typography: a humanist sans-serif (e.g., Inter / Noto Sans) — **must** pick a font with solid Tamil glyph support (Noto Sans Tamil pairs well with Noto Sans for English, keeping visual consistency across languages).
- Corner radius: consistently rounded (12–16px) for a friendly, non-clinical feel.
- Iconography: consistent icon set (Lucide or Heroicons) — same visual language for map pins as for UI icons.

---

## 14. Backend API Design

```
POST   /api/session                     → create anonymous session
GET    /api/departments                 → list departments
GET    /api/departments/{id}/doctors    → doctors in a department
POST   /api/assistant/query             → { text, sessionId } → Gemini-backed recommendation
GET    /api/map/floors/{floorId}        → floor image metadata + node/edge graph for that floor
POST   /api/navigation/route            → { fromNodeId, toNodeId, avoidStairs } → computed path + instructions
POST   /api/navigation/recalculate      → { sessionId, currentX, currentY, floor, destinationNodeId }
POST   /api/beacons/resolve             → { uuid, major, minor } → known beacon location (or use a cached client-side table instead of round-tripping every scan)
WS     /ws/position                     → live position broadcast channel (optional real-time feature)

--- Admin (authenticated) ---
POST/PUT/DELETE /api/admin/locations
POST/PUT/DELETE /api/admin/connections
POST/PUT/DELETE /api/admin/departments
POST/PUT/DELETE /api/admin/doctors
POST/PUT/DELETE /api/admin/beacons
```

---

## 15. Database Schema

```sql
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(50) NOT NULL,   -- ENTRANCE, REGISTRATION, PHARMACY, LAB, LIFT, STAIRCASE, DEPARTMENT, WASHROOM, ...
    floor INT NOT NULL,
    block VARCHAR(50),
    x_coordinate DOUBLE PRECISION NOT NULL,
    y_coordinate DOUBLE PRECISION NOT NULL,
    landmark VARCHAR(200)
);

CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    from_node INT REFERENCES locations(id),
    to_node INT REFERENCES locations(id),
    distance_meters DOUBLE PRECISION NOT NULL,
    edge_type VARCHAR(20) NOT NULL DEFAULT 'CORRIDOR' -- CORRIDOR, LIFT, STAIRCASE
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    location_id INT REFERENCES locations(id)
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    department_id INT REFERENCES departments(id),
    room_number VARCHAR(20),
    availability VARCHAR(200),
    is_simulated BOOLEAN DEFAULT TRUE   -- honesty flag, see §6.2
);

CREATE TABLE ble_beacons (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(64) NOT NULL,
    major INT NOT NULL,        -- encodes floor
    minor INT NOT NULL,        -- encodes specific node/beacon
    location_id INT REFERENCES locations(id),
    tx_power_at_1m INT,        -- calibrated per beacon, see §8.2
    battery_installed_date DATE
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    language VARCHAR(5) NOT NULL,   -- 'ta' or 'en'
    started_at TIMESTAMP DEFAULT now(),
    entrance_location_id INT REFERENCES locations(id)
);
```

---

## 16. Real-World Platform Constraints (read before coding)

These are the constraints that will bite you late if not designed around from the start.

1. **Web Bluetooth is not supported on iOS Safari or Chrome-on-iOS at all** (Apple restricts it platform-wide, not a Chrome limitation). Since many hospital visitors will have iPhones, **BLE-based correction cannot be the only localization mechanism**. Build a fallback: place a small QR code sticker at each beacon location (reusing your existing QR infrastructure), and let iOS users tap "scan to confirm position" at decision points as a manual correction, while Android users get the automatic BLE correction. Document this platform split explicitly in your report as a known limitation with a designed mitigation — this is a *strength* in an academic writeup, not a weakness, if you show you identified and solved it.
2. **iOS requires an explicit user gesture to grant motion sensor access** (`DeviceMotionEvent.requestPermission()`, Safari 13+) — must be triggered from a button tap, not on page load. Build this into the Permission Priming screen (§13.3).
3. **Everything requires HTTPS** — Web Bluetooth, motion sensors, and speech recognition all refuse to run on plain HTTP except `localhost`. Set up HTTPS (even a free Let's Encrypt cert or a tunneling tool like ngrok during development) early, don't leave it for later.
4. **Tamil voice synthesis availability is inconsistent** across devices — handled via cloud TTS fallback (§12).
5. **`SpeechRecognition` support is Chrome-first**; Safari's support is partial and iOS Safari's is unreliable. Always ship a text-input fallback as a first-class path, never assume voice will work.
6. **Hospital WiFi is often poor/absent** — the PWA shell (map assets, core UI) should be cached via a service worker so the app remains usable even on a flaky connection; only the AI assistant call strictly needs live connectivity.

---

## 17. Security & Privacy

- Sessions are anonymous by default — no patient identity is collected or required for navigation to work.
- If a symptom-query log is stored for analytics/improvement, store it decoupled from any identifying session data, and disclose this in an in-app privacy note (important for a healthcare-adjacent app even in prototype form).
- Gemini API key lives only in backend environment variables, never shipped to the client bundle.
- Admin panel behind authentication; patient-facing routes need none.

---

## 18. Testing & Evaluation Metrics (for your IEEE paper)

- **Localization accuracy:** mean/median positional error (meters) between estimated and ground-truth position at marked test points — measure with and without BLE correction to demonstrate the hybrid approach's improvement over PDR-only.
- **Task completion time:** time for a first-time user to reach a destination via HospiGuide vs. asking staff for directions (baseline comparison) — a strong, simple headline result for your paper.
- **Route recalculation responsiveness:** time from deviation detection to updated route display.
- **System Usability Scale (SUS):** standard 10-question usability questionnaire administered to test users after a session — gives you a citable quantitative usability score.
- **Voice/AI assistant accuracy:** % of symptom queries correctly mapped to the intended department, evaluated against a labeled test set you construct.

---

## 19. Development Roadmap / Build Order

Build in this order — each phase produces something demoable, which matters for review checkpoints:

1. **Phase 1 — Static map + manual routing:** digitize campus map, seed `locations`/`connections`, get A* working with a hardcoded start/end, render route on Leaflet. No sensors yet.
2. **Phase 2 — AI assistant (text-only):** chat UI, Gemini integration, department/doctor resolution, "Start Navigation" hands off to Phase 1's routing.
3. **Phase 3 — PDR localization:** live blue-dot movement from phone sensors alone (expect visible drift — this is expected and fine at this stage).
4. **Phase 4 — BLE integration:** deploy 4–6 beacons at key points, add correction logic, measure drift reduction.
5. **Phase 5 — Dynamic recalculation + turn-by-turn instructions.**
6. **Phase 6 — Voice I/O + Tamil localization.**
7. **Phase 7 — Polish pass:** onboarding/permission screens, animations, accessibility routing, admin panel.
8. **Phase 8 — Evaluation:** run the metrics in §18 with real test users on campus for your paper's results section.

---

## 20. Instructions for GitHub Copilot

When generating code against this specification:
- Match the repository structure in §5 exactly; place new files in the correct `feature/` folder.
- Never hardcode campus-specific labels ("Library", "Canteen") in logic — always branch on `category` enum values, since the same code must work unmodified for a real hospital deployment.
- All user-facing strings go through the i18n system (`ta.json` / `en.json`) — no inline hardcoded English strings in components.
- Keep the Gemini API key and any secrets server-side only (Node.js `.env` environment variables) — never in frontend code.
- Prefer Leaflet (`L.CRS.Simple`) for map rendering per §7.1 unless a specific task calls for the React Konva overlay.
- When writing localization/sensor code, always guard for browser API availability (`if ('bluetooth' in navigator)`, etc.) and provide the fallback described in §16 rather than assuming the API exists.
- Database entities should mirror the schema in §15 field-for-field, including the `is_simulated` flag on `doctors`.
- Favor small, composable React components in `shared/components` over large monolithic screen files.
