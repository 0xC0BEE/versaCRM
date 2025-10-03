/**
 * Converts a File object into a Base64 encoded string (data URL).
 * This is useful for embedding file data directly for previews or API submission.
 * @param file The File object to convert.
 * @returns A promise that resolves with the data URL string.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};
