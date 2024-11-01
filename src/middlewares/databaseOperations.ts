// wrap around function to avoid repeating the try-catch block
// FIXME: Uradio si try catch ali u catchu throwujes error. Opet ti onda treba try catch u ostalim pozivima
export async function handleDbOperation<T>(dbOperation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
        return await dbOperation();
    } catch (error) {
        console.error('Database operation failed: ' + errorMessage + ' ', error);
        throw new Error(errorMessage);
    }
}
