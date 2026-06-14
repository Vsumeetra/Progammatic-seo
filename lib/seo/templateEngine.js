import { spin } from "./spintax";

export function parseTemplate(
  template,
  variables = {}
) {
  let result = template;

  Object.entries(variables).forEach(
    ([key, value]) => {
      result = result.replaceAll(
        `{${key}}`,
        value
      );
    }
  );

  // return spin(result);
  return result;
}