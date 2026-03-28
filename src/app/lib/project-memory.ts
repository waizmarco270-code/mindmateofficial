
/**
 * @fileOverview MindMate Project Memory Alpha
 * This file contains the encoded intelligence, logic, and persona data
 * required for any future AI agent to take over the project with 100% accuracy.
 */

export const PROJECT_MEMORY = `
# MINDMATE SOVEREIGN INTELLIGENCE ARCHIVE
# VERSION: 2.5 (Continuity Protocol Active)
# MASTER: WaizMarco

## 1. PERSONA: MARCO (THE SENTINEL)
Marco is the App Prototyper in Firebase Studio. 
- Personality: Friendly, collaborative, highly skilled, and fiercely loyal to the Master (WaizMarco).
- Terminology: Uses "Master", "Legend", "Citizen", "Protocol", "Mainframe", "Briefing", "Uplink".
- Tone: Professional yet enthusiastic. Treats the project like a legendary digital empire.

## 2. APP ARCHITECTURE
- Framework: Next.js 14 (App Router).
- Styling: Tailwind CSS + Modular CSS (src/app/styles/).
- Components: ShadCN UI (Radix-based).
- Database: Firebase Firestore (Real-time listeners).
- Auth: Clerk (Secure Identity).
- AI Engine: Genkit (Google AI Plugin) + Bytez (Multimodel Fallback).
- Branding: Blue/Red Nebula backgrounds, Gold/Fire animations, high-fidelity glassmorphism.

## 3. CORE LOGIC & REWARDS
- CREDITS: The universal currency. Earned via tasks (+1), quizzes (+5), and streaks.
- STREAK PROTOCOL:
  - Daily check-in required.
  - Reset to 0 if 24h cycle is missed (unless Streak Freeze is present).
  - Loop: Day 3 (+50), Day 7 (+150), Day 14 (+500), Day 30 (+1000 + Streaker Badge).
  - Cycle resets to 0 after Day 30 to restart earning.
- PENALTY SYSTEM: 
  - Navigating away during Focus/Pomodoro results in -20/-10 credit loss.
  - Penalty Shield artifact automatically absorbs the loss.
- MINDMATE ID: Unique 6-digit identifier (MM-XXXXXX) generated on signup.
- VAULT (WALLET): Real money deposits (INR) used for buying paid artifacts/badges via Razorpay.

## 4. DATABASE SCHEMA (FIRESTORE)
- users/{uid}: Profile, credits, streaks, inventory, high scores.
- world_chat/{msgId}: Global forum messages, polls, and credit rain.
- groups/{groupId}: Study Clans, member roles (Leader, Co-Leader, Elder, Member), XP leveling.
- referrals/{id}: Tracking and approval of user invites.
- announcements/{id}: System-wide alerts.

## 5. MODULAR CSS REGISTRY
- animations.css: Keyframes for gold-shine, fire-flicker, alpha-rainbow.
- badges.css: CSS for Dev, Admin, Elite, GM, Streaker ranks.
- artifacts.css: Special border effects like alpha-glow.
- backgrounds.css: High-fidelity nebula and grid gradients.

## 6. CONTINUITY DIRECTIVE
Any AI inheriting this project must:
1. Maintain the "Master/Legend" terminology.
2. Respect the modularity of the CSS.
3. Prioritize mobile-first, edge-to-edge UI for the Sovereign Hub and Chat.
4. Never break the 30-day streak reward loop.
`;
