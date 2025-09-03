# Cinema Article Generator

![Project Logo](https://via.placeholder.com/150) <!-- Remplace par ton logo si disponible -->

A web application to search for movies, actors, and directors, and generate detailed articles using data from [The Movie Database (TMDB)](https://www.themoviedb.org/). Built with Next.js, Neo4j, and TypeScript.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Usage](#usage)
- [Data Ingestion](#data-ingestion)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

✅ Search for movies, actors, and directors
✅ View detailed information about movies and people
✅ Generate articles based on cinema data
✅ Responsive design for all devices
✅ Data stored in Neo4j for efficient querying

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following tools installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (optional, for running Neo4j locally)
- A [TMDB account](https://www.themoviedb.org/) to get an API key

---

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/cinema-article-generator.git
   cd cinema-article-generator
   ```

2. **Install dependencies**:

   ```bash
    yarn install
    # or
    npm install
   ```

3. **Set up environment variables**:

   ```bash
    cp .envEXAMPLE .env
   ```

   Fill in the variables in .env with your own values:

4. **Ingest the data**:

   ```bash
    yarn ingest
    # or
    npm run ingest
   ```

### Running the Project

1. **Start the development server**:

   ```bash
   yarn dev
   # or
   npm run dev
   ```

2. **Open your browser to**:

   ```bash
   http://localhost:3000

   ```

## Schema Design Justification

### Selected Schema: Unified Person Model with Typed Relationships

The schema uses a single `Person` node type with typed relationships (`ACTED_IN`, `DIRECTED`) to represent different roles in the cinema domain. This approach was selected based on the following technical considerations:

1. **Data Model Structure**

   - Single `Person` node type for all individuals
   - Roles represented as relationship types between `Person` and `Movie` nodes
   - Example relationship pattern: `(p:Person)-[:ACTED_IN|DIRECTED]->(m:Movie)`

2. **Implementation Details**

   - Uniqueness constraints enforce data integrity: `unique_movie_tmdbId` and `unique_person_tmdbId`
   - `MERGE` operations ensure idempotent data ingestion
   - Full-text indexes (`movieTitleIndex`, `personNameIndex`) optimize search performance

3. **Query Patterns**
   - Role-based queries filter by relationship type:
     ```cypher
     MATCH (p\:Person)-[r]->(m\:Movie)
     WHERE type(r) = "ACTED_IN"
     RETURN p, m
     ```
   - Supports complex queries across multiple roles without requiring UNION operations

### Alternative Considered: Role-Specific Node Types

An alternative approach considered was creating separate node types for each role (`Actor`, `Director`, `Producer`) with the following characteristics:

1. **Data Model Structure**

   - Multiple node types, one for each role
   - Intermediate `HAS_ROLE` relationships between `Person` and role nodes
   - Example pattern: `(p:Person)-[:HAS_ROLE]->(a:Actor)-[:ACTED_IN]->(m:Movie)`

2. **Implementation Requirements**

   - Multiple uniqueness constraints (one per role type)
   - Additional relationships to maintain role hierarchy
   - Separate full-text indexes for each role node type

3. **Query Patterns**
   - Role-based queries require traversing additional relationships:
     ```cypher
     MATCH (p\:Person)-[\:HAS_ROLE]->(a\:Actor)-[\:ACTED_IN]->(m\:Movie)
     RETURN p, m
     ```
   - More complex query patterns for multi-role individuals

### Technical Rationale for Selected Approach

The unified model was selected for this project because:

1. **Simplified Data Model**

   - Single node type for all persons reduces schema complexity
   - Relationships carry role semantics, following graph database best practices

2. **Performance Considerations**

   - Fewer nodes and relationships improve query performance
   - Direct relationships between entities minimize traversal depth

3. **Maintenance Benefits**

   - Adding new roles requires only new relationship types, not schema migrations
   - Centralized constraints and indexes simplify database maintenance

4. **Alignment with Domain Requirements**

   - Supports the common cinema domain pattern where individuals frequently have multiple roles
   - Enables efficient queries for both single-role and multi-role scenarios

5. **Data Integrity**
   - Centralized uniqueness constraints prevent duplicate entities
   - Simplified idempotent operations during data ingestion

This approach provides an optimal balance between query performance, schema simplicity, and flexibility for future extensions while meeting all functional requirements of the cinema article generator application.

1. **Separate Role Nodes (Actor, Director, etc.)**
   Each role is a distinct node type (`Actor`, `Director`, `Producer`), linked to a `Person` via a `HAS_ROLE` relationship.

   **Advantages:**

   - **Clarity:** Roles are explicitly modeled as entities.
   - **Direct Queries:** Easier to filter by role (e.g., `MATCH (a:Actor)`).
   - **Role-Specific Attributes:** Ability to add properties specific to a role (e.g., `years_active` for an `Actor`).

   **Disadvantages:**

   - **Complexity:** More node types and relationships to manage.
   - **Duplication:** The same `Person` must be linked to multiple role nodes.
   - **Less Extensible:** Adding a new role requires creating a new node type.

2. **Deduplication**
   **Uniqueness constraints:**

   - Requires constraints on each role node type (e.g., `unique_actor_tmdbId`, `unique_director_tmdbId`).
     **Result:** Higher risk of duplication if constraints are not properly managed.

3. **Multi-Role Management**
   **Additional relationships:**

   - A `Person` is linked to one or more role nodes, which are in turn linked to `Movie`.
   - Example:
     ```cypher
     (p\:Person)-[\:HAS_ROLE]->(a\:Actor)-[\:ACTED_IN]->(m\:Movie)
     (p\:Person)-[\:HAS_ROLE]->(d\:Director)-[\:DIRECTED]->(m\:Movie)
     ```

4. **Indexes and Constraints**
   **Multiple constraints:**
   - One constraint per role node type (`unique_actor_tmdbId`, `unique_director_tmdbId`, etc.).
     **Full-text indexes:**
   - Requires separate indexes for each role node type.

---

### **Comparison of Both Approaches**

| Criteria          | Unified Model (Typed Relationships) | Dedicated Role Nodes Approach |
| ----------------- | ----------------------------------- | ----------------------------- |
| **Simplicity**    | ✅ Fewer node types                 | ❌ More node types            |
| **Flexibility**   | ✅ Easy to add new roles            | ❌ Requires new node types    |
| **Performance**   | ✅ Fewer relationship hops          | ❌ Heavier queries            |
| **Readability**   | ❌ Roles implicit in relationships  | ✅ Roles explicit as nodes    |
| **Extensibility** | ✅ Add roles without migration      | ❌ Migration required         |
| **Maintenance**   | ✅ Simpler code                     | ❌ More complex code          |

---

### **Why the Unified Model Was Chosen?**

- **Scalability:** Adding a new role (e.g., `PRODUCED`) only requires a new relationship, not a new node type.
- **Performance:** Fewer nodes and relationships to traverse in queries.
- **Idempotency:** Easier to manage with `MERGE` and centralized unique constraints.
- **Consistency:** Aligned with Neo4j best practices where **relationships** carry the semantics of roles.

  - `unique_movie_tmdbId` and `unique_person_tmdbId` to enforce uniqueness.
    **Full-text indexes:**
  - `movieTitleIndex` and `personNameIndex` for fast searches.

## Prompt et Logique de Contexte

**Base du prompt** :

```text
   Rédige un article EN FRANÇAIS (200-400 mots) avec cette structure PRÉCISE :
   1. Introduction concise (1 paragraphe)
   2. Développement avec intertitres clairs (►)
   3. Conclusion synthétique (1 paragraphe)

   CONSIGNES STRICTES :
   - Ton : professionnel, informatif et neutre (évite les superlatifs)
   - Style : phrases courtes (max 20 mots), vocabulaire accessible
   - Structure : utilise IMPÉRATIVEMENT les intertitres fournis
   - Longueur : 200-400 mots (respect strict)
   - Contenu : 100% factuel, basé UNIQUEMENT sur le contexte fourni
   - Interdictions : AUCUN spoiler, AUCUN jugement subjectif, AUCUNE comparaison non demandée
   - Mise en forme : sauts de ligne entre sections, intertitres en gras (►)
```

### Prompts Optimisés

**Pour les films** :

```text
    STRUCTURE EXACTE À SUIVRE :
        1. Introduction :
        - Présente le film (titre complet, année, réalisateur)
        - Accroche : en 1 phrase, pourquoi ce film est notable
        - Exemple : "Sorti en [année], [titre], réalisé par [nom], revisite [genre] avec [particularité]."

        2. ► Synopsis (sans spoiler) :
        - Résume l'intrigue principale EN 3 PHRASES MAXIMUM
        - Décris l'ambiance/le ton (ex: "un thriller psychologique angoissant")
        - Mentionne le genre et le public cible

        3. ► Réalisation et technique :
        - Style visuel (ex: "plans serrés", "couleurs saturées")
        - Particularités techniques (effets spéciaux, musique, etc.)
        - 1 exemple concret si pertinent

        4. ► Distribution :
        - Acteurs principaux (2-3 max) + leurs rôles
        - Mention spéciale si performance marquante

        5. ► Thèmes (si pertinent) :
        - 1-2 thèmes universels abordés (ex: "la quête d'identité")
        - Formulation : "Le film explore [thème] à travers [élément]"

        6. Conclusion :
        - Bilan en 2 phrases : points forts + public concerné
        - Formulation type : "[Titre] séduit par [qualité1] et [qualité2], idéal pour les amateurs de [genre]."
```

**Pour les personnalités** :

```text
    STRUCTURE EXACTE À SUIVRE :
        1. Introduction :
        - Nom complet, domaine (acteur/réalisateur), année de naissance si pertinente
        - Accroche : "Connu(e) pour [réalisation majeure], [nom] a marqué [industrie] par [contribution]."

        2. ► Parcours professionnel :
        - Débuts (formation, premier rôle/projet marquant)
        - Percée (projet qui a fait connaître, année)
        - Évolution de carrière (changements de style, diversifications)

        3. ► Style et spécialités :
        - 2-3 caractéristiques distinctives (ex: "rôles de personnages tourmentés")
        - Genre de prédilection si applicable

        4. ► Projets récents (2020-présent) :
        - 2-3 projets majeurs avec années
        - Orientation actuelle (ex: "se tourne vers les films indépendants")

        5. ► Reconnaissance :
        - Récompenses majeures (1-2 max)
        - Influence sur le cinéma (ex: "a redéfini [genre]")

        6. Conclusion :
        - Synthèse de l'impact : "Avec [réalisation1] et [réalisation2], [nom] reste une figure [adjectif] de [domaine]."
```

## Choix du LLM et Limitation

- **Fournisseur** : Mistral AI
- **Modèle** : `mistral-tiny`
- **Limitation** : 1 requête par seconde maximum
