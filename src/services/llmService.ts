import { Mistral } from "@mistralai/mistralai";

export async function generateArticle(
  context: string,
  type: "movie" | "person"
): Promise<string> {
  if (!process.env.LLM_API_KEY) {
    throw new Error("Missing Mistral API KEY (LLM_API_KEY)");
  }

  const client = new Mistral({ apiKey: process.env.LLM_API_KEY });
  const prompt = getOptimizedPrompt(context, type);

  try {
    const response = await client.chat.complete({
      model: "mistral-tiny",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const firstChoice = response.choices[0];
    if (!firstChoice?.message?.content) {
      throw new Error("Empty LLM response");
    }
    let content = "";
    if (typeof firstChoice.message.content === "string") {
      content = firstChoice.message.content;
    } else if (Array.isArray(firstChoice.message.content)) {
      content = firstChoice.message.content
        .filter(
          (chunk): chunk is { type: "text"; text: string } =>
            chunk.type === "text"
        )
        .map((chunk) => chunk.text)
        .join("");
    } else {
      throw new Error("Unsupported response format");
    }

    if (!content.trim()) {
      throw new Error("No valid text content generated");
    }

    return content.trim();
  } catch (error) {
    console.error("[LLM Error]:", error);
    throw new Error(
      error instanceof Error
        ? `LLM error : ${error.message}`
        : "Unknown error while generating"
    );
  }
}

function getOptimizedPrompt(context: string, type: "movie" | "person"): string {
  const baseInstructions = `
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
    `;

  if (type === "movie") {
    return `
        ${baseInstructions}
  
        CONTEXTE FILM :
        ${context}
  
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
      `;
  } else {
    return `
        ${baseInstructions}
  
        CONTEXTE PERSONNALITÉ :
        ${context}
  
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
      `;
  }
}
