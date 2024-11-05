// wrap around function to avoid repeating the try-catch block
export async function handleDbOperation<T>(dbOperation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
        return await dbOperation();
    } catch (error) {
        console.error('Database operation failed: ' + errorMessage + ' ', error);
    }
}
