// Generate unique ID
export function uid() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
