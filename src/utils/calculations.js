/**
 * Business Logic Calculations for Dashboard Analytics
 * Handles monthly averages, stockout predictions, and restock recommendations
 */

import { findBestMatch } from './fuzzyMatch';

/**
 * Calculates monthly average from monthly purchase data
 * @param {Object} monthlyData - { jan: 10, fev: 20, ... }
 * @returns {number} - Average purchases per month
 */
export const calculateMonthlyAverage = (monthlyData) => {
    if (!monthlyData) return 0;

    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const values = monthNames.map(m => monthlyData[m] || 0);
    const sum = values.reduce((acc, val) => acc + val, 0);

    return sum / 12;
};

/**
 * Calculates days until stockout based on current stock and average monthly consumption
 * @param {number} currentStock - Current available quantity
 * @param {number} avgMonthly - Average monthly consumption
 * @param {number} futureArrivals - Quantity expected to arrive (optional)
 * @returns {number} - Estimated days until stockout (0 if already out)
 */
export const calculateDaysToStockout = (currentStock, avgMonthly, futureArrivals = 0) => {
    if (avgMonthly <= 0) return Infinity; // No consumption, won't run out

    const totalAvailable = currentStock + futureArrivals;

    if (totalAvailable <= 0) return 0; // Already out of stock

    const monthsOfStock = totalAvailable / avgMonthly;
    return Math.ceil(monthsOfStock * 30); // Convert months to days
};

/**
 * Calculates recommended restock quantity
 * @param {number} avgMonthly - Average monthly consumption
 * @param {number} currentStock - Current available quantity
 * @param {number} futureArrivals - Quantity expected to arrive (optional)
 * @param {number} bufferMonths - Desired buffer in months (default: 2)
 * @returns {number} - Recommended quantity to order
 */
export const calculateRestockQuantity = (avgMonthly, currentStock, futureArrivals = 0, bufferMonths = 2) => {
    if (avgMonthly <= 0) return 0;

    const desiredStock = avgMonthly * bufferMonths;
    const totalAvailable = currentStock + futureArrivals;
    const needed = Math.max(0, desiredStock - totalAvailable);

    return Math.ceil(needed);
};

/**
 * Matches products between stock and monthly purchases using fuzzy matching
 * @param {Array} stockData - Array of stock items
 * @param {Array} purchasesData - Array of monthly purchase items
 * @returns {Array} - Enriched data with stock + purchase info
 */
export const matchStockWithPurchases = (stockData, purchasesData) => {
    if (!stockData || !purchasesData) return [];

    const enrichedData = [];

    for (const purchase of purchasesData) {
        // Try to find matching stock item
        const matchResult = findBestMatch(purchase.code, stockData, 0.6);

        const stockQty = matchResult ? matchResult.product.quantity : 0;
        const stockCode = matchResult ? matchResult.product.code : null;

        enrichedData.push({
            ...purchase,
            stockQuantity: stockQty,
            stockCode: stockCode,
            matchScore: matchResult ? matchResult.score : 0,
            hasStock: stockQty > 0
        });
    }

    return enrichedData;
};

/**
 * Identifies products at risk of stockout
 * @param {Array} enrichedData - Output from matchStockWithPurchases
 * @param {Array} shipmentsData - Optional future arrivals data
 * @param {number} warningDaysThreshold - Days threshold for warning (default: 45)
 * @returns {Array} - Products with rupture risk, sorted by urgency
 */
export const identifyRuptureRisks = (enrichedData, shipmentsData = null, warningDaysThreshold = 45) => {
    if (!enrichedData || enrichedData.length === 0) return [];

    const risks = [];

    for (const product of enrichedData) {
        // Skip products with no purchase history
        if (product.avgMonthly <= 0) continue;

        // Find future arrivals for this product
        let futureQty = 0;
        if (shipmentsData && shipmentsData.detailed) {
            const shipmentMatch = findBestMatch(product.code, shipmentsData.detailed, 0.6);
            futureQty = shipmentMatch ? shipmentMatch.product.quantity : 0;
        }

        const daysToStockout = calculateDaysToStockout(
            product.stockQuantity,
            product.avgMonthly,
            futureQty
        );

        // Only include products at risk (within threshold)
        if (daysToStockout <= warningDaysThreshold) {
            const recommendedQty = calculateRestockQuantity(
                product.avgMonthly,
                product.stockQuantity,
                futureQty,
                2 // 2 months buffer
            );

            risks.push({
                ...product,
                futureArrivals: futureQty,
                daysToStockout: daysToStockout,
                riskLevel: daysToStockout <= 15 ? 'critical' : daysToStockout <= 30 ? 'high' : 'medium',
                recommendedRestockQty: recommendedQty,
                estimatedCost: recommendedQty * 100 // Mock cost, can be replaced with real data
            });
        }
    }

    // Sort by urgency (least days first)
    return risks.sort((a, b) => a.daysToStockout - b.daysToStockout);
};

/**
 * Calculates sales opportunities (products selling well in market but not in stock)
 * @param {Array} purchasesData - Monthly purchases (market data)
 * @param {Array} stockData - Current stock
 * @param {number} topN - Number of top opportunities to return
 * @returns {Array} - Top sales opportunities
 */
export const calculateSalesOpportunities = (purchasesData, stockData, topN = 10) => {
    if (!purchasesData || !stockData) return [];

    const opportunities = [];

    // Sort purchases by total (market demand)
    const sortedByDemand = [...purchasesData].sort((a, b) => b.total - a.total);

    for (const product of sortedByDemand) {
        // Find in stock
        const matchResult = findBestMatch(product.code, stockData, 0.6);
        const currentStock = matchResult ? matchResult.product.quantity : 0;

        // Calculate opportunity score
        // High demand + low stock = high opportunity
        const demandScore = product.total;
        const stockRatio = currentStock / (product.avgMonthly * 2 || 1); // How many months of stock
        const opportunityScore = demandScore * (1 / Math.max(stockRatio, 0.1));

        opportunities.push({
            ...product,
            currentStock: currentStock,
            stockRatio: stockRatio,
            opportunityScore: opportunityScore,
            suggestedOrderQty: Math.ceil(product.avgMonthly * 2) // 2 months worth
        });
    }

    // Sort by opportunity score and return top N
    return opportunities
        .sort((a, b) => b.opportunityScore - a.opportunityScore)
        .slice(0, topN);
};

/**
 * Identifies products frequently purchased together (for bundle recommendations)
 * @param {Array} purchasesData - Monthly purchases data
 * @param {number} correlationThreshold - Minimum correlation score (0-1)
 * @returns {Array} - Suggested product bundles
 */
export const suggestProductBundles = (purchasesData, correlationThreshold = 0.6) => {
    if (!purchasesData || purchasesData.length < 2) return [];

    const bundles = [];
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    // Compare each product pair
    for (let i = 0; i < purchasesData.length; i++) {
        for (let j = i + 1; j < purchasesData.length; j++) {
            const productA = purchasesData[i];
            const productB = purchasesData[j];

            // Calculate correlation: how often they're purchased in same months
            let correlationScore = 0;
            let matchingMonths = 0;

            for (const month of monthNames) {
                const qtyA = productA.monthly[month] || 0;
                const qtyB = productB.monthly[month] || 0;

                // Both purchased in same month
                if (qtyA > 0 && qtyB > 0) {
                    matchingMonths++;
                    correlationScore += Math.min(qtyA, qtyB); // Weight by quantity
                }
            }

            const normalizedCorrelation = matchingMonths / 12; // 0-1 score

            if (normalizedCorrelation >= correlationThreshold) {
                bundles.push({
                    productA: productA.name,
                    productB: productB.name,
                    codeA: productA.code,
                    codeB: productB.code,
                    correlation: normalizedCorrelation,
                    matchingMonths: matchingMonths,
                    averageComboQty: Math.ceil(correlationScore / matchingMonths),
                    suggestedBundleQty: Math.ceil((productA.avgMonthly + productB.avgMonthly) / 2)
                });
            }
        }
    }

    // Sort by correlation strength
    return bundles.sort((a, b) => b.correlation - a.correlation);
};

/**
 * Calculates gap analysis: market potential vs actual purchases
 * @param {Array} marketData - All products available in market
 * @param {Array} purchaseHistory - What client actually bought
 * @returns {Object} - { missedOpportunities, totalGap }
 */
export const calculateGapAnalysis = (marketData, purchaseHistory) => {
    if (!marketData || !purchaseHistory) {
        return { missedOpportunities: [], totalGap: 0 };
    }

    const missedOpportunities = [];
    let totalGap = 0;

    for (const marketProduct of marketData) {
        const matchResult = findBestMatch(marketProduct.code, purchaseHistory, 0.7);

        if (!matchResult) {
            // Product available in market but client never bought it
            missedOpportunities.push({
                ...marketProduct,
                type: 'never_purchased',
                potentialValue: marketProduct.total,
                gap: marketProduct.total
            });
            totalGap += marketProduct.total;
        } else {
            // Product purchased, but maybe less than market potential
            const clientPurchase = matchResult.product;
            const gap = marketProduct.total - clientPurchase.total;

            if (gap > 0) {
                missedOpportunities.push({
                    ...marketProduct,
                    type: 'under_purchased',
                    clientPurchased: clientPurchase.total,
                    potentialValue: marketProduct.total,
                    gap: gap
                });
                totalGap += gap;
            }
        }
    }

    return {
        missedOpportunities: missedOpportunities.sort((a, b) => b.gap - a.gap),
        totalGap: totalGap,
        conversionRate: (purchaseHistory.length / marketData.length) * 100
    };
};

/**
 * Formats currency to BRL
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

/**
 * Formats number with thousands separator
 */
export const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
};
