/**
 * Fuzzy Matching Utilities for Product Name Comparison
 * Handles variations like: "DLS-9" vs "DLS 9", "DW-902 POWER" vs "DW902POWER"
 */

/**
 * Normalizes a product name for comparison
 * - Removes special characters (-, /, etc.)
 * - Converts to lowercase
 * - Removes extra spaces
 */
export const normalizeProductName = (name) => {
    if (!name) return '';
    return String(name)
        .toLowerCase()
        .replace(/[-_\/\\()]/g, ' ')  // Replace separators with space
        .replace(/\s+/g, ' ')          // Normalize multiple spaces
        .trim();
};

/**
 * Extracts the product code (first part before description)
 * Examples: "ACD-340" from "ACD-340 DESCRIPTION", "DW-902" from "DW902 POWER"
 */
export const extractProductCode = (name) => {
    if (!name) return '';
    const normalized = normalizeProductName(name);
    // Get first word/segment (usually the code)
    const match = normalized.match(/^([a-z0-9\s]+?)(?:\s|$)/i);
    return match ? match[1].trim() : normalized;
};

/**
 * Calculates similarity between two strings using Levenshtein-like approach
 * Returns a score from 0 (no match) to 1 (perfect match)
 */
export const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 1;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    // Check if shorter is contained in longer
    if (longer.includes(shorter)) {
        return 0.8 + (0.2 * (shorter.length / longer.length));
    }

    // Calculate edit distance
    const editDistance = getEditDistance(str1, str2);
    return (longer.length - editDistance) / longer.length;
};

/**
 * Levenshtein distance algorithm
 */
const getEditDistance = (str1, str2) => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
};

/**
 * Finds the best match for a product name in a list of products
 * Returns the matched product and similarity score
 *
 * @param {string} searchName - Product name to search for
 * @param {Array} productList - List of products with 'name' property
 * @param {number} threshold - Minimum similarity score (0-1) to consider a match
 * @returns {Object|null} - { product, score } or null if no match
 */
export const findBestMatch = (searchName, productList, threshold = 0.6) => {
    if (!searchName || !productList || productList.length === 0) {
        return null;
    }

    const normalizedSearch = normalizeProductName(searchName);
    const searchCode = extractProductCode(searchName);

    let bestMatch = null;
    let bestScore = 0;

    for (const product of productList) {
        // Try matching with full name
        const normalizedProductName = normalizeProductName(product.name);
        let score = calculateSimilarity(normalizedSearch, normalizedProductName);

        // Also try matching product codes (usually more reliable)
        const productCode = extractProductCode(product.name);
        const codeScore = calculateSimilarity(searchCode, productCode);

        // Use the higher score
        score = Math.max(score, codeScore);

        // Exact code match gets bonus
        if (searchCode === productCode && searchCode.length > 0) {
            score = Math.max(score, 0.95);
        }

        if (score > bestScore && score >= threshold) {
            bestScore = score;
            bestMatch = { product, score };
        }
    }

    return bestMatch;
};

/**
 * Checks if two product names match (fuzzy comparison)
 *
 * @param {string} name1 - First product name
 * @param {string} name2 - Second product name
 * @param {number} threshold - Minimum similarity score to consider match
 * @returns {boolean}
 */
export const fuzzyMatch = (name1, name2, threshold = 0.7) => {
    if (!name1 || !name2) return false;

    const norm1 = normalizeProductName(name1);
    const norm2 = normalizeProductName(name2);

    // Quick exact match
    if (norm1 === norm2) return true;

    // Code matching
    const code1 = extractProductCode(name1);
    const code2 = extractProductCode(name2);
    if (code1 === code2 && code1.length > 0) return true;

    // Similarity check
    const score = calculateSimilarity(norm1, norm2);
    return score >= threshold;
};

/**
 * Creates a combined display name using ITEM code and MODELO description
 * Prioritizes MODELO if available, falls back to ITEM
 *
 * @param {string} item - Product code (ITEM column)
 * @param {string} modelo - Product description (MODELO column)
 * @returns {string} - Best display name
 */
export const createDisplayName = (item, modelo) => {
    if (!item && !modelo) return '';

    // If modelo is empty or just whitespace, use item
    if (!modelo || !modelo.trim()) {
        return String(item).trim();
    }

    // If modelo already contains the item code, just use modelo
    if (normalizeProductName(modelo).includes(normalizeProductName(item))) {
        return String(modelo).trim();
    }

    // Otherwise, combine: "ITEM - MODELO"
    return `${String(item).trim()} - ${String(modelo).trim()}`;
};
