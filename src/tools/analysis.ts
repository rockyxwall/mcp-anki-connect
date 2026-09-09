import { callAnkiConnect } from '../methods/anki.js';

export interface DeckSubdeckSummary {
    deckName: string;
    cardCount: number;
    noteCount: number;
    exactNoteCount: number;
}

export interface DeckSummaryResponse {
    deck: string;
    totalCards: number;
    totalNotes: number;
    subdecks: DeckSubdeckSummary[];
}

export interface TagCount {
    tag: string;
    noteCount: number;
    cardCount: number;
}

export interface BatchTagMapping {
    deckName: string;
    tag: string;
}

export interface BatchTagResult {
    deckName: string;
    tag: string;
    notesTagged: number;
    error?: string;
}

/**
 * Returns a high-level summary of a deck and its subdecks using native query engine.
 * Fast, lightweight, zero payload bloat.
 */
export async function getDeckSummary(deckName: string, includeSubdecks: boolean = true): Promise<DeckSummaryResponse> {
    const allDecksRes = await callAnkiConnect<string[]>({
        action: 'deckNames',
        version: 6
    });

    const matchingDecks = (allDecksRes.result || []).filter(d => 
        d === deckName || (includeSubdecks && d.startsWith(deckName + '::'))
    );

    const subdecks: DeckSubdeckSummary[] = [];
    const allNotes = new Set<number>();
    let totalCards = 0;

    for (const d of matchingDecks) {
        // Query cards in this subdeck
        const cardsRes = await callAnkiConnect<number[]>({
            action: 'findCards',
            version: 6,
            params: { query: `deck:"${d}"` }
        });
        const cardCount = cardsRes.result ? cardsRes.result.length : 0;
        totalCards += cardCount;

        // Query notes in this subdeck including subdecks
        const notesRes = await callAnkiConnect<number[]>({
            action: 'findNotes',
            version: 6,
            params: { query: `deck:"${d}"` }
        });
        const noteCount = notesRes.result ? notesRes.result.length : 0;
        (notesRes.result || []).forEach(id => allNotes.add(id));

        // Query exact notes directly in this deck (excluding child subdecks)
        const exactNotesRes = await callAnkiConnect<number[]>({
            action: 'findNotes',
            version: 6,
            params: { query: `deck:"${d}" -deck:"${d}::*"` }
        });
        const exactNoteCount = exactNotesRes.result ? exactNotesRes.result.length : 0;

        subdecks.push({
            deckName: d,
            cardCount,
            noteCount,
            exactNoteCount
        });
    }

    return {
        deck: deckName,
        totalCards,
        totalNotes: allNotes.size,
        subdecks: subdecks.sort((a, b) => b.cardCount - a.cardCount)
    };
}

/**
 * Returns note and card counts for tags, optionally filtered by prefix.
 */
export async function getTagSummary(prefix?: string): Promise<{ tags: TagCount[] }> {
    const allTagsRes = await callAnkiConnect<string[]>({
        action: 'getTags',
        version: 6
    });

    let tags = allTagsRes.result || [];
    if (prefix) {
        const lower = prefix.toLowerCase();
        tags = tags.filter(t => t.toLowerCase().startsWith(lower));
    }

    const results: TagCount[] = [];
    for (const tag of tags) {
        const notesRes = await callAnkiConnect<number[]>({
            action: 'findNotes',
            version: 6,
            params: { query: `tag:"${tag}"` }
        });
        const cardsRes = await callAnkiConnect<number[]>({
            action: 'findCards',
            version: 6,
            params: { query: `tag:"${tag}"` }
        });

        results.push({
            tag,
            noteCount: notesRes.result ? notesRes.result.length : 0,
            cardCount: cardsRes.result ? cardsRes.result.length : 0
        });
    }

    return { tags: results };
}

/**
 * Applies hierarchical tags to notes strictly inside specified deck.
 */
export async function batchTagByDeck(mappings: BatchTagMapping[]): Promise<BatchTagResult[]> {
    const results: BatchTagResult[] = [];

    for (const m of mappings) {
        try {
            // Find notes strictly in this deck (excluding children)
            const exactNotesRes = await callAnkiConnect<number[]>({
                action: 'findNotes',
                version: 6,
                params: { query: `deck:"${m.deckName}" -deck:"${m.deckName}::*"` }
            });

            const noteIds = exactNotesRes.result || [];
            if (noteIds.length === 0) {
                results.push({ deckName: m.deckName, tag: m.tag, notesTagged: 0 });
                continue;
            }

            await callAnkiConnect({
                action: 'addTags',
                version: 6,
                params: {
                    notes: noteIds,
                    tags: m.tag
                }
            });

            results.push({
                deckName: m.deckName,
                tag: m.tag,
                notesTagged: noteIds.length
            });
        } catch (err: any) {
            results.push({
                deckName: m.deckName,
                tag: m.tag,
                notesTagged: 0,
                error: err.message || String(err)
            });
        }
    }

    return results;
}
