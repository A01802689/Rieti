# Rieti

Sistema de reporte de incidentes ciudadanos para Atizapán de Zaragoza. El repositorio contiene tres proyectos independientes:

- **RietiAPI** — API backend (Node.js + TypeScript + Express).
- **RietiDashboard** — Panel de administración web (React + TypeScript + Vite).
- **RietiApp** — App móvil para Android (Kotlin + Jetpack Compose).

Cada proyecto se maneja por separado (tiene su propio `package.json` o proyecto Gradle); no hay un build único para todo el repo.

## RietiAPI

```bash
cd RietiAPI
npm install
npm run dev     # modo desarrollo
npm run test    # pruebas
docker build .  # crear imagen (produccion)
```

## RietiDashboard

```bash
cd RietiDashboard
npm install
npm run dev     # servidor de desarrollo
npm run build   # build de producción
```

## RietiApp

Proyecto Android ubicado en `RietiApp/`. Debe abrirse con Android Studio:


## Estado del proyecto

Los tres componentes están en etapa temprana de desarrollo (UI y estructura base), sin integración completa entre ellos todavía.
