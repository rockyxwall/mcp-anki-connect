import { findNotes, notesInfo, updateNoteFields, addTags } from './notes.js';
import { retrieveMediaFile } from './media.js';
import { multi } from './misc.js';
import { cardsInfo } from './cards.js';

export interface ImageOcclusionNoteSummary {
    noteId: number;
    modelName: string;
    deckName?: string;
    imageFilename: string | null;
    hasComments: boolean;
    hasHeader: boolean;
    header: string;
    comments: string;
}

export interface ListImageOcclusionNotesResult {
    totalFound: number;
    matchingCount: number;
    notes: ImageOcclusionNoteSummary[];
}

export interface ImageOcclusionNoteDetail {
    noteId: number;
    modelName: string;
    deckName?: string;
    imageFilename: string | null;
    imageBase64: string | null;
    occlusionCount: number;
    fields: {
        Header: string;
        BackExtra: string;
        Comments: string;
        Occlusion: string;
    };
    cards: number[];
}

export interface ImageOcclusionUpdate {
    noteId: number;
    description: string; // Stored in Comments field
    header?: string;
    backExtra?: string;
    tags?: string[];
}

/**
 * Extract image filename from Anki HTML field.
 */
export function extractImageFilename(fieldValue?: string): string | null {
    if (!fieldValue) return null;
    const match = fieldValue.match(/src=["']?([^"'>\s]+)["']?/i);
    return match ? match[1] : null;
}

/**
 * List Image Occlusion notes with filtering by deck and missing description.
 */
export async function listImageOcclusionNotes(options: {
    deckName?: string;
    missingOnly?: boolean;
    limit?: number;
    offset?: number;
} = {}): Promise<ListImageOcclusionNotesResult> {
    const { deckName, missingOnly = true, limit = 50, offset = 0 } = options;

    let query = '(note:"Image Occlusion" OR note:"Image Occlusion Enhanced")';
    if (deckName) {
        query = `deck:"${deckName}" ${query}`;
    }

    const findRes = await findNotes(query);
    const allNoteIds = findRes.result || [];
    if (allNoteIds.length === 0) {
        return { totalFound: 0, matchingCount: 0, notes: [] };
    }

    // Fetch notes info in batches of 100
    const batchSize = 100;
    const allNotes: any[] = [];
    for (let i = 0; i < allNoteIds.length; i += batchSize) {
        const slice = allNoteIds.slice(i, i + batchSize);
        const infoRes = await notesInfo(slice);
        if (infoRes.result) {
            allNotes.push(...infoRes.result);
        }
    }

    // Filter and map
    const matching: ImageOcclusionNoteSummary[] = [];
    for (const n of allNotes) {
        const header = n.fields?.Header?.value?.trim() || '';
        const comments = n.fields?.Comments?.value?.trim() || '';
        const hasComments = comments.length > 0;
        const hasHeader = header.length > 0;

        if (missingOnly && hasComments) {
            continue;
        }

        const imageVal = n.fields?.Image?.value || '';
        const imageFilename = extractImageFilename(imageVal);

        matching.push({
            noteId: n.noteId,
            modelName: n.modelName,
            imageFilename,
            hasComments,
            hasHeader,
            header,
            comments
        });
    }

    const pagedNotes = matching.slice(offset, offset + limit);

    // Optionally attach deckName by checking first card if cards exist
    if (pagedNotes.length > 0) {
        const sampleCardIds: number[] = [];
        const noteMap = new Map<number, any>();
        for (const pn of pagedNotes) {
            const raw = allNotes.find((x: any) => x.noteId === pn.noteId);
            if (raw && raw.cards && raw.cards.length > 0) {
                sampleCardIds.push(raw.cards[0]);
                noteMap.set(raw.cards[0], pn);
            }
        }
        if (sampleCardIds.length > 0) {
            const cInfo = await cardsInfo(sampleCardIds);
            if (cInfo.result) {
                for (const card of cInfo.result) {
                    const target = noteMap.get(card.cardId);
                    if (target) {
                        target.deckName = card.deckName;
                    }
                }
            }
        }
    }

    return {
        totalFound: allNoteIds.length,
        matchingCount: matching.length,
        notes: pagedNotes
    };
}

/**
 * Retrieve an Image Occlusion note with its image base64 data and occlusion details.
 */
export async function getImageOcclusionNote(noteId: number): Promise<ImageOcclusionNoteDetail> {
    const infoRes = await notesInfo([noteId]);
    if (!infoRes.result || infoRes.result.length === 0) {
        throw new Error(`Note ${noteId} not found`);
    }

    const note = infoRes.result[0];
    const imageVal = note.fields?.Image?.value || '';
    const imageFilename = extractImageFilename(imageVal);

    let imageBase64: string | null = null;
    if (imageFilename) {
        const mediaRes = await retrieveMediaFile(imageFilename);
        if (typeof mediaRes.result === 'string') {
            imageBase64 = mediaRes.result;
        }
    }

    const occlusionVal = note.fields?.Occlusion?.value || '';
    const clozeMatches = occlusionVal.match(/\{\{c\d+::/g);
    const occlusionCount = clozeMatches ? clozeMatches.length : 0;

    let deckName: string | undefined;
    if (note.cards && note.cards.length > 0) {
        const cInfo = await cardsInfo([note.cards[0]]);
        if (cInfo.result && cInfo.result[0]) {
            deckName = cInfo.result[0].deckName;
        }
    }

    return {
        noteId,
        modelName: note.modelName,
        deckName,
        imageFilename,
        imageBase64,
        occlusionCount,
        fields: {
            Header: note.fields?.Header?.value || '',
            BackExtra: note.fields?.['Back Extra']?.value || '',
            Comments: note.fields?.Comments?.value || '',
            Occlusion: occlusionVal
        },
        cards: note.cards || []
    };
}

/**
 * Update an Image Occlusion note's description (saved to Comments) and optionally Header/Back Extra/Tags.
 */
export async function updateImageOcclusionDescription(update: ImageOcclusionUpdate): Promise<{ success: boolean; noteId: number }> {
    const { noteId, description, header, backExtra, tags } = update;

    const fieldsToUpdate: Record<string, string> = {
        Comments: description
    };

    if (header !== undefined) {
        fieldsToUpdate.Header = header;
    }
    if (backExtra !== undefined) {
        fieldsToUpdate['Back Extra'] = backExtra;
    }

    const res = await updateNoteFields({
        id: noteId,
        fields: fieldsToUpdate
    });

    if (res.error) {
        throw new Error(`Failed to update note ${noteId}: ${res.error}`);
    }

    if (tags && tags.length > 0) {
        await addTags([noteId], tags.join(' '));
    }

    return { success: true, noteId };
}

/**
 * Atomically batch-update descriptions and headers for multiple Image Occlusion notes.
 */
export async function batchUpdateImageOcclusionDescriptions(updates: ImageOcclusionUpdate[]): Promise<{ updatedCount: number }> {
    const actions: any[] = [];

    for (const update of updates) {
        const fieldsToUpdate: Record<string, string> = {
            Comments: update.description
        };
        if (update.header !== undefined) {
            fieldsToUpdate.Header = update.header;
        }
        if (update.backExtra !== undefined) {
            fieldsToUpdate['Back Extra'] = update.backExtra;
        }

        actions.push({
            action: 'updateNoteFields',
            version: 6,
            params: {
                note: {
                    id: update.noteId,
                    fields: fieldsToUpdate
                }
            }
        });

        if (update.tags && update.tags.length > 0) {
            actions.push({
                action: 'addTags',
                version: 6,
                params: {
                    notes: [update.noteId],
                    tags: update.tags.join(' ')
                }
            });
        }
    }

    if (actions.length === 0) {
        return { updatedCount: 0 };
    }

    const multiRes = await multi(actions);
    if (multiRes.error) {
        throw new Error(`Batch update error: ${multiRes.error}`);
    }

    return { updatedCount: updates.length };
}

