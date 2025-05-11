const capitalizeAndTruncate = (str, maxLength) => {
  if (!str) return "";

  // Capitalize first letter
  let formattedStr = str.charAt(0).toUpperCase() + str.slice(1);

  // Truncate if needed
  if (formattedStr.length > maxLength) {
    return formattedStr.slice(0, maxLength) + "...";
  }

  return formattedStr;
};

export default capitalizeAndTruncate