/** Turns a category name into a URL-safe anchor fragment, e.g. "Promises and Time" -> "promises-and-time". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
