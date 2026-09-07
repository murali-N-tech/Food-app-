# FoodFusion - Next-Gen Food Delivery Platform

## Overview
FoodFusion is a comprehensive, full-stack food delivery application engineered for performance, reliability, and an exceptional user experience. Built with React, Vite, Tailwind CSS, and Firebase, this platform connects customers, restaurant partners, and delivery drivers in real-time.

## Benchmarking & Bug Resolutions
During development, we actively benchmarked against production e-commerce and food delivery websites (e.g., `naikfoods.co.in`) to identify and proactively resolve common industry bugs. The following critical bugs were prevented/fixed in our architecture:

1. **Volatile Cart State (Fixed)**
   - *Industry Bug:* Many food delivery sites lose the user's cart contents if the page is accidentally refreshed.
   - *Our Solution:* We implemented robust `localStorage` synchronization within the `CartContext`, ensuring cart persistence across sessions and page reloads.

2. **Incomplete Checkout Validation (Fixed)**
   - *Industry Bug:* Users are occasionally able to click "Place Order" without a valid delivery address, causing backend fulfillment failures and stuck orders.
   - *Our Solution:* We introduced strict UI-level state validation in `Checkout.tsx`. The order pipeline is blocked with clear user feedback if the geolocation or manual address fields are empty.

3. **Missing "Page Not Found" Handling (Fixed)**
   - *Industry Bug:* Broken product links or manually manipulated URLs often crash single-page applications or render blank white screens.
   - *Our Solution:* A global wildcard `NotFound` (404) route was implemented to catch invalid URLs and gracefully redirect users back to the homepage.

4. **Cumulative Layout Shift (CLS) on Load (Fixed)**
   - *Industry Bug:* Pages jump around as images and data load, leading to accidental clicks (a frustrating experience on mobile).
   - *Our Solution:* We entirely replaced standard spinner loaders with structural Skeleton Screen animations across the Home, Profile, Search, and Restaurant views. This pre-allocates DOM space and guarantees a smooth perceived load.

5. **Cross-Restaurant Cart Contamination**
   - *Industry Bug:* Adding items from multiple restaurants into a single cart breaks the localized delivery fee logic.
   - *Our Solution:* The cart logic safely clears existing items when a user attempts to add a dish from a completely different restaurant, maintaining single-origin order integrity.

## Core Features
* **Role-Based Access Control:** Distinct secure dashboards for `CUSTOMER`, `RESTAURANT`, `DELIVERY_PARTNER`, and `ADMIN`.
* **Smart Meal Planner:** Uses Google Gemini AI to dynamically generate personalized meal plans based on user budget and dietary restrictions.
* **Real-time Order Tracking:** Interactive UI for tracking order states from `PLACED` to `DELIVERED`.
* **Customer Reviews System:** Authenticated customers can leave rich star ratings and text feedback after successful deliveries.
* **Dynamic Geolocation:** One-tap location detection for accurate delivery routing.

## Tech Stack
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React (Icons), Framer Motion (Animations).
* **Backend / Database:** Firebase (Auth, Firestore DB).
* **AI Engine:** Google GenAI SDK (Gemini 3.6 Flash).
* **Maps & Geolocation:** `@vis.gl/react-google-maps`.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` file contains the required keys:
   ```env
   GEMINI_API_KEY=your_gemini_key
   VITE_GOOGLE_MAPS_API_KEY=your_maps_key
   ```
   Firebase configuration is automatically injected via `firebase-applet-config.json`.

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm run start
   ```

## License
MIT License
