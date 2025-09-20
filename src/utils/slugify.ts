export function slugify(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,'')
}
