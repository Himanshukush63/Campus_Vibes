// utils/Utils.js
export const formatValue = (value) => {
    // Remove currency formatting and return plain numbers
    return value.toLocaleString(); // Formats numbers with commas (e.g., 1000 -> 1,000)
  };