// utils/formatters.ts
export const formatEuroPrice = (price: number): string => {
	return new Intl.NumberFormat('nl-BE', {
	  style: 'currency',
	  currency: 'EUR',
	  minimumFractionDigits: 2,
	  maximumFractionDigits: 2
	}).format(price);
  };
  
  // Make sure price is always in the correct format
  export const standardizePrice = (price: number | string): number => {
	const numPrice = typeof price === 'string' ? parseFloat(price) : price;
	return Number(numPrice.toFixed(2));
  };