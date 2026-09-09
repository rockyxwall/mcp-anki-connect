import { AnkiConnectResponse, AnkiConnectRequest } from '../types/anki';

// Use environment variable with fallback to default
const BASE_URL = process.env.ANKI_CONNECT_URL || 'http://127.0.0.1:8765';

export async function callAnkiConnect<T = any>(request: AnkiConnectRequest): Promise<AnkiConnectResponse<T>> {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`AnkiConnect HTTP error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json() as AnkiConnectResponse<T>;
        return data;
    } catch (error) {
        throw error;
    }
}