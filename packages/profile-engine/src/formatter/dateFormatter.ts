/**
 * Date Formatter
 * Normalizes different date formats (e.g. "MM/YYYY", "Jan 2020", timestamps) into a standard ISO string or Date object.
 */

export class DateFormatter {
  static toDate(value: any): Date | null {
    if (!value) return null;
    
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number') {
      return new Date(value);
    }

    if (typeof value === 'string') {
      // Check for common mm/yyyy or mm/dd/yyyy
      const parts = value.split(/[/-]/);
      if (parts.length === 2) {
        // Assume mm/yyyy
        const monthStr = parts[0];
        const yearStr = parts[1];
        if (monthStr && yearStr) {
          const month = parseInt(monthStr, 10);
          const year = parseInt(yearStr, 10);
          if (month >= 1 && month <= 12 && year > 1900) {
            return new Date(year, month - 1, 1);
          }
        }
      }

      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  }

  static toISOString(value: any): string | null {
    const date = this.toDate(value);
    return date ? date.toISOString() : null;
  }

  static toMonthYear(value: any): string | null {
    const date = this.toDate(value);
    if (!date) return null;
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  }
}
