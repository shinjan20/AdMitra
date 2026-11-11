/**
 * Formats a number to Indian Rupee format (₹)
 * Example: 5000 -> ₹5,000
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const rounded = showDecimals ? amount.toFixed(2) : Math.round(amount).toString();
  const parts = rounded.split('.');
  
  // Format integer part using Indian grouping: 3 digits, then groups of 2
  let intPart = parts[0];
  const lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== '') {
    intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    intPart = lastThree;
  }

  if (parts.length > 1 && showDecimals) {
    return `₹${intPart}.${parts[1]}`;
  }
  return `₹${intPart}`;
}

export function formatCompactINR(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${Math.round(amount)}`;
}

