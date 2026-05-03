# CLAUDE.md

## What this project is

nextwave is the backend for a surfing iOS app.

The problem it solves: surf data is complex (wave height, period, direction, wind) and most surfers don't know how to interpret it. The app translates that data into simple, personalized recommendations — "today is great for you to surf at Beach X" — and notifies the user when ideal conditions arrive, via push notification.

The user sets up their profile once (surf level, preferred wave height, wind tolerance) and the app does the rest.

## Who uses it

Surfers of all levels, mainly beginners and intermediates who can't read technical surf forecasts. The app launches first in Brazil, focused on Brazilian beaches.

## How the app works (main flow)

1. User creates an account and sets up their surf preferences
2. The backend fetches ocean conditions every hour via the Open-Meteo Marine API
3. A scoring algorithm (0–100) compares each spot's conditions against the user's preferences
4. The app displays spots sorted by score with a simple label: "great", "good", "fair", or "poor"
5. If a favorite spot's score reaches the threshold configured by the user, they receive a push notification

## Stack summary

* Fastify + TypeScript — REST API
* PostgreSQL + Prisma — database and ORM
* node-cron — scheduled jobs (condition fetching + alert checking)
* Firebase FCM — push notifications for iOS
* Open-Meteo Marine API — wave and wind data (free)
* Railway — deployment and hosting

## Important decisions already made

* No Redis — ocean condition caching is handled directly in Postgres (the `fetchedAt` field)
* No BullMQ — node-cron is sufficient for the initial volume
* No Stripe for now — monetization is a post-launch phase
* Apple Sign-In is mandatory (App Store requirement for apps with social login)

Do not suggest alternatives to these decisions without asking first.

## Development context

The project is in its early stages. Prioritize simple, easy-to-maintain solutions. When there are two ways to solve something, ask and suggest the more readable one. This is a solo project — there is no team, so code clarity is worth more than premature optimization.
