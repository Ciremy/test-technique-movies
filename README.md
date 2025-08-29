This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Justifications liées au contraintes

Choix de Conception du Schéma Neo4j

1. Modèle Person + Rôles (vs. Actor/Director séparés)

Un seul type de nœud Person avec des relations typées (ACTED_IN, DIRECTED) pour représenter les rôles.
Avantages :

Flexibilité : Une même personne peut avoir plusieurs rôles (ex. : acteur ET réalisateur).
Simplicité : Moins de types de nœuds et pas de duplication.
Extensibilité : Facile d’ajouter de nouveaux rôles (ex. : PRODUCED).

2. Déduplication et Idempotence

Contraintes d’unicité :

unique_movie_tmdbId et unique_person_tmdbId pour éviter les doublons.

Utilisation de MERGE :

Garantit que les nœuds/relations ne sont créés qu’une seule fois.

Résultat : Le script peut être relancé sans créer de doublons.

3. Gestion des Multi-Rôles

Relations typées :

Une Person peut avoir plusieurs relations vers des Movie (ex. : ACTED_IN, DIRECTED).

4. Index et Contraintes

Contraintes :

unique_movie_tmdbId et unique_person_tmdbId pour garantir l’unicité.

Index full-text :

movieTitleIndex et personNameIndex pour des recherches rapides.
