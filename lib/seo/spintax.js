export function spin(text) {
    if (!text) return "";
  
    return text.replace(
      /\{([^{}]+)\}/g,
      (_, match) => {
        const options = match.split("|");
  
        return options[
          Math.floor(
            Math.random() * options.length
          )
        ];
      }
    );
  }