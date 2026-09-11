import { callAnkiConnect } from '../methods/anki.js';
import {
    ModelNamesResponse,
    ModelNamesAndIdsResponse,
    ModelFieldNamesResponse,
    ModelFieldsOnTemplatesResponse,
    AnkiConnectRequest
} from '../types/anki';

/**
 * Get the complete list of model names for the current user
 */
export async function modelNames(): Promise<ModelNamesResponse> {
    const request: AnkiConnectRequest = {
        action: 'modelNames',
        version: 6
    };

    return await callAnkiConnect<string[]>(request);
}

/**
 * Get the complete list of model names and their corresponding IDs for the current user
 */
export async function modelNamesAndIds(): Promise<ModelNamesAndIdsResponse> {
    const request: AnkiConnectRequest = {
        action: 'modelNamesAndIds',
        version: 6
    };

    return await callAnkiConnect<Record<string, number>>(request);
}

/**
 * Get the complete list of field names for the provided model name
 * @param modelName - Name of the model to get field names for
 */
export async function modelFieldNames(modelName: string): Promise<ModelFieldNamesResponse> {
    const request: AnkiConnectRequest = {
        action: 'modelFieldNames',
        version: 6,
        params: {
            modelName
        }
    };

    return await callAnkiConnect<string[]>(request);
}

/**
 * Returns an object indicating the fields on the question and answer side of each card template for the given model name.
 * The question side is given first in each array.
 * @param modelName - Name of the model to get template fields for
 */
export async function modelFieldsOnTemplates(modelName: string): Promise<ModelFieldsOnTemplatesResponse> {
    const request: AnkiConnectRequest = {
        action: 'modelFieldsOnTemplates',
        version: 6,
        params: {
            modelName
        }
    };

    return await callAnkiConnect<Record<string, string[][]>>(request);
}

/**
 * Returns an object mapping template names (card types) to their front and back HTML definitions
 * @param modelName - Name of the model to get card templates for
 */
export async function modelTemplates(modelName: string): Promise<import('../types/anki').ModelTemplatesResponse> {
    const request: AnkiConnectRequest = {
        action: 'modelTemplates',
        version: 6,
        params: {
            modelName
        }
    };

    return await callAnkiConnect<Record<string, import('../types/anki').ModelCardTemplate>>(request);
}

/**
 * Rename a card template (card type) within a model
 * @param modelName - Name of the model
 * @param oldTemplateName - Current name of the template
 * @param newTemplateName - New name for the template
 */
export async function modelTemplateRename(
    modelName: string,
    oldTemplateName: string,
    newTemplateName: string
): Promise<import('../types/anki').AnkiConnectResponse<null>> {
    const request: AnkiConnectRequest = {
        action: 'modelTemplateRename',
        version: 6,
        params: {
            modelName,
            oldTemplateName,
            newTemplateName
        }
    };

    return await callAnkiConnect<null>(request);
}

/**
 * Update the front and back HTML of card templates for an existing model
 * @param model - Model object containing model name and templates map
 */
export async function updateModelTemplates(model: {
    name: string;
    templates: Record<string, { Front?: string; Back?: string }>;
}): Promise<import('../types/anki').AnkiConnectResponse<null>> {
    const request: AnkiConnectRequest = {
        action: 'updateModelTemplates',
        version: 6,
        params: {
            model
        }
    };

    return await callAnkiConnect<null>(request);
}

/**
 * Get CSS styling for a model
 * @param modelName - Name of the model
 */
export async function modelStyling(modelName: string): Promise<import('../types/anki').ModelStylingResponse> {
    const request: AnkiConnectRequest = {
        action: 'modelStyling',
        version: 6,
        params: {
            modelName
        }
    };

    return await callAnkiConnect<{ css: string }>(request);
}

/**
 * Remove note types (models) that have 0 notes assigned
 */
export async function removeEmptyModels(): Promise<import('../types/anki').AnkiConnectResponse<null>> {
    const request: AnkiConnectRequest = {
        action: 'removeEmptyNotes',
        version: 6
    };

    return await callAnkiConnect<null>(request);
}