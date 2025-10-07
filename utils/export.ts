/**
 * Flattens a nested object into a single-level object with dot notation keys.
 * @param obj The object to flatten.
 * @param parent The parent key (used for recursion).
 * @param res The result object.
 */
function flattenObject(obj: any, parent: string = '', res: { [key: string]: any } = {}): { [key: string]: any } {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const propName = parent ? parent + '.' + key : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], propName, res);
      } else {
        res[propName] = obj[key];
      }
    }
  }
  return res;
}


/**
 * Converts an array of objects (including nested ones) to a CSV string.
 * @param data Array of objects.
 * @returns The CSV string.
 */
function convertToCSV(data: any[]): string {
    if (!data || data.length === 0) {
        return '';
    }

    const flattenedData = data.map(row => flattenObject(row));
    
    // Get all unique headers from all rows
    const allHeaders = new Set<string>();
    flattenedData.forEach(row => {
        Object.keys(row).forEach(key => allHeaders.add(key));
    });
    const headers = Array.from(allHeaders);

    const csvRows = [headers.join(',')];

    for (const row of flattenedData) {
        const values = headers.map(header => {
            const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
            const escaped = val.replace(/"/g, '""');
            if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
                 return `"${escaped}"`;
            }
            return escaped;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

/**
 * Triggers a browser download for a CSV file.
 * @param data Array of objects to be exported.
 * @param filename The desired filename for the downloaded file.
 */
export function exportToCSV(data: any[], filename: string): void {
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
