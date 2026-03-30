# 3D Kitchen Cabinet Configurator

An interactive 3D web application for positioning and configuring kitchen cabinet models in real time.
Live preview: https://cabinets-task.vercel.app/

## Features

- **3D/2D view toggle** — switch between a perspective 3D view and a top-down orthographic view
- **Drag and drop** — drag cabinet models freely across the floor plane
- **Collision detection** — models cannot overlap; they push apart on contact
- **Y-axis rotation** — select a model and rotate it using a slider (0–360°)
- **Persistent state** — all positions and rotations are saved to Firestore and restored on page reload

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Three.js](https://threejs.org/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` file with your Firebase project credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 3D Models

Models used in this project are sourced from [Poly Pizza](https://poly.pizza) under the [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/) license.

- **Wooden Kitchen Sink** by Zsky — [poly.pizza/m/gtnHSsBONa](https://poly.pizza/m/gtnHSsBONa)
- **Double Door Base Cabinet** by Zsky — [poly.pizza/m/2FOj8MjUB6](https://poly.pizza/m/2FOj8MjUB6)

## Usage

- **Click** a model to select it and reveal the rotation slider
- **Drag** a selected or unselected model to reposition it
- **Toggle** between 3D and 2D (top-down) view using the button in the top right
- In 2D mode, left-click pans the view and scroll zooms
- Changes are saved automatically — refreshing the page restores the last saved state
