type ClassValue = string | number | boolean | undefined | null | { [key: string]: boolean } | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];

  for (const cls of classes) {
    if (!cls) continue;
    
    if (typeof cls === 'string' || typeof cls === 'number') {
      result.push(String(cls));
    } else if (typeof cls === 'object') {
      if (Array.isArray(cls)) {
        result.push(cn(...cls));
      } else {
        for (const key in cls) {
          if (cls[key]) {
            result.push(key);
          }
        }
      }
    }
  }

  // Simplified custom class merger (doesn't handle complex tailwind conflict resolution without tailwind-merge, but good enough for simple cases)
  return result.join(' ').trim();
}
