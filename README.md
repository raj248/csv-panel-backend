# Node.js + TypeScript + Express Template

A boilerplate/template to kickstart a new **Node.js** project using **TypeScript** and **Express** with a sensible setup for development and production.

---

## 🔍 Features

- TypeScript for static typing
- Express for HTTP server & routing
- `nodemon` + `ts-node` for fast development (auto-reload)
- Structured folder layout (`src` / `dist`)
- Source maps, declaration files
- Configuration for strict type checks, `esModuleInterop`, etc.
- Built-in scripts for building, running in dev & production

---

## 🛠 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (preferably version 16 or newer)
- npm (comes bundled with Node)

### Setup / Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/raj248/nodejs-ts-template.git
   cd nodejs-ts-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Dev dependencies**

   These are already included, e.g.:

   ```bash
   npm install --save-dev typescript ts-node @types/node @types/express nodemon
   ```

4. **Configure TypeScript**

   There’s a `tsconfig.json` preconfigured. Key settings:

   - `module`: CommonJS (or you can switch to ES module if required)
   - `target`: `esnext`
   - `rootDir`: `./src`
   - `outDir`: `./dist`
   - Strict type checking enabled

5. **Scripts**

   The `package.json` scripts:

   ```json
   "scripts": {
     "dev": "nodemon",
     "build": "tsc",
     "start": "node dist/index.js",
     "clean": "rimraf ./dist"
   }
   ```

   - `npm run dev` → Runs in development mode with auto-reload
   - `npm run build` → Compiles `.ts` to `.js` into `dist`
   - `npm start` → Runs the compiled production code
   - `npm clean` → Removes `dist` folder

---

## ⚙ Configuration

- **nodemon.json** ‒ defines what files/folders to watch, and what extensions to trigger reloads
- **tsconfig.json** ‒ TypeScript compiler settings
- `.gitignore` ‒ ignore `node_modules`, `dist`, `.env` etc.
- `.env` or `.env.example` (if you include env variables) for configuration based on environment. [Learn more](https://github.com/raj248/Wisdom_Vault/blob/master/Env_File_Setup.md)
- currenly using dotenvFlow for env variable

---

## 🪜 Workflow

1. **Dev mode**

   ```bash
   npm run dev
   ```

   Works with live reloading.

2. **Build for production**

   ```bash
   npm run build
   ```

3. **Start production server**

   ```bash
   npm start
   ```

---

## 🤝 Contributing

If you want to contribute:

- Fork the repo
- Create a branch like `feature/my-feature` or `fix/bug-description`
- Make your changes, ensure TypeScript compiles without errors
- Submit a Pull Request with a description of the changes

---

## ⚖️ License

- This project is licensed under the [MIT License](./LICENSE).

## 📄 Acknowledgments

- Thanks to **Express** for routing and server framework
- Thanks to **TypeScript** for type safety
- Thanks to tooling like **nodemon** & **ts-node** for improving dev workflow

---

## 🗂 Folder Structure (suggested)

```
nodejs-ts-template/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── index.ts
│   └── (other modules)
├── dist/             # compiled js output
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
├── README.md
└── (optional) .env.example
```

---
