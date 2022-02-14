export function someSet<T>(s: Set<T>, fn: (s: T) => boolean) {
  const iterator1 = s.entries()
  for (const [entry] of iterator1) {
    if (fn(entry)) return true
  }
  return false
}
