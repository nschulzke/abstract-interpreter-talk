export function renderSinks(sinks: Record<string, any>) {
  return Object.entries(sinks).map(([name, value]) => `${name}: ${value}`).join(", ");
}
