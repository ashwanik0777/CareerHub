// ────────────────────────────────────────────────────────────────────────────
// Ontology Registry — Indexed Lookup Structures
// ────────────────────────────────────────────────────────────────────────────
// Provides efficient access to the Professional Profile Ontology via
// pre-computed indexes. Built once on import; all lookups are O(1) or O(n).
// ────────────────────────────────────────────────────────────────────────────

import { PROFILE_ONTOLOGY, OntologyAttribute, SemanticCategory } from '@platform/types';

// ── Pre-computed Indexes ─────────────────────────────────────────────────────

/** Map from attribute ID → OntologyAttribute */
const idIndex: Map<string, OntologyAttribute> = new Map();

/** Map from SemanticCategory → OntologyAttribute[] */
const categoryIndex: Map<SemanticCategory, OntologyAttribute[]> = new Map();

/** Map from alias (lowercased) → attribute ID */
const aliasIndex: Map<string, string> = new Map();

// Build indexes on module load
for (const attr of PROFILE_ONTOLOGY) {
  // ID index
  idIndex.set(attr.id, attr);

  // Category index
  const catList = categoryIndex.get(attr.category) || [];
  catList.push(attr);
  categoryIndex.set(attr.category, catList);

  // Alias index — map every alias to its parent attribute ID
  for (const alias of attr.aliases) {
    aliasIndex.set(alias.toLowerCase(), attr.id);
  }
  // Also index the label itself as an alias
  aliasIndex.set(attr.label.toLowerCase(), attr.id);
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Retrieve an ontology attribute by its unique ID.
 * @param id - Attribute ID (e.g., 'personalInfo.firstName')
 * @returns The matching OntologyAttribute, or undefined
 */
export function getAttributeById(id: string): OntologyAttribute | undefined {
  return idIndex.get(id);
}

/**
 * Retrieve all ontology attributes belonging to a semantic category.
 * @param category - The SemanticCategory to filter by
 * @returns Array of matching attributes (may be empty)
 */
export function getAttributesByCat(category: SemanticCategory): OntologyAttribute[] {
  return categoryIndex.get(category) || [];
}

/**
 * Get the complete alias→attributeId mapping.
 * Every alias (lowercased) maps to its parent attribute's ID.
 * @returns A new Map copy of the alias index
 */
export function getAllAliasMap(): Map<string, string> {
  return new Map(aliasIndex);
}

/**
 * Build a searchable text blob for an ontology attribute.
 * Concatenates the label, description, and all aliases into a single
 * lowercase string suitable for tokenization and similarity computation.
 * @param attr - The OntologyAttribute to process
 * @returns Concatenated searchable text
 */
export function getSearchableText(attr: OntologyAttribute): string {
  return [attr.label, attr.description, ...attr.aliases].join(' ').toLowerCase();
}

/**
 * Return all attributes defined in the ontology.
 * @returns A shallow copy of the full attribute array
 */
export function getAllAttributes(): OntologyAttribute[] {
  return [...PROFILE_ONTOLOGY];
}
