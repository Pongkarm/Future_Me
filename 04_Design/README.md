# FutureMe design source

> Integration reviewed: 11 August 2026

This folder contains the design assets that still feed the runnable product.

- [`FutureMe_Mascot_Lab/`](FutureMe_Mascot_Lab/) is the canonical mascot source.
- The web app imports synchronized mascot assets from this folder and verifies them with
  `npm run check:mascot`.
- In the live app, mascot motion starts on across the journey. A persisted control lets the learner
  return to the operating-system motion preference.
- The implemented interface and current screenshots live in
  [`03_WebApp/`](../03_WebApp/).

Superseded concept galleries and generated comparison prototypes were removed from the active
branch. Their history remains available through Git when design archaeology is needed.
