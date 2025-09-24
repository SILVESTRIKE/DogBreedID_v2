export function getFieldsFromObject<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = { ...obj };
    keys.forEach((key) => {
        if (key in result) {
        result[key] = obj[key];
        }
    });
  return result;
}
