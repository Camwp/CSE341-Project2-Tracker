
export const swaggerSpec = (baseURL) => ({
    openapi: "3.0.3",
    info: {
        title: "OneCardDex API",
        version: "1.0.0",
        description:
            "Track exactly one current card per National Pokédex number (1–1025). Replace with a cooler print over time; old cards are moved to history."
    },
    servers: [{ url: baseURL || "http://localhost:3000" }],
    tags: [
        { name: "DexCards", description: "Manage one-per-Pokémon binder slots" },
        { name: "Admin", description: "Dev/seed helpers (not for production)" }
    ],
    components: {
        schemas: {
            CardSnapshot: {
                type: "object",
                required: ["cardName", "setCode", "rarity"],
                properties: {
                    cardName: { type: "string", example: "Chansey" },
                    setCode: { type: "string", example: "SV4a" },
                    setName: { type: "string", example: "Shiny Treasure ex" },
                    subset: { type: "string", example: "SAR" },
                    cardNumber: { type: "string", example: "123/190" },
                    rarity: { type: "string", example: "Special Illustration Rare" },
                    language: { type: "string", enum: ["EN", "JP", "KR", "DE", "FR", "ES", "IT", "PT"], default: "EN" },
                    condition: { type: "string", enum: ["NM", "LP", "MP", "HP", "DMG"], default: "NM" },
                    finish: { type: "string", example: "full-art" },
                    isGraded: { type: "boolean", default: false },
                    grade: { type: "string", example: "PSA 10" },
                    imageUrl: { type: "string", format: "uri" },
                    acquiredAt: { type: "string", format: "date" },
                    pricePaid: { type: "number", example: 20.0 },
                    marketPrice: { type: "number", example: 25.0 },
                    notes: { type: "string", maxLength: 500 }
                }
            },
            DexCardHistoryItem: {
                type: "object",
                properties: {
                    replacedAt: { type: "string", format: "date-time" },
                    reason: { type: "string", example: "upgrade" },
                    card: { $ref: "#/components/schemas/CardSnapshot" }
                }
            },
            DexCard: {
                type: "object",
                properties: {
                    dex: { type: "integer", minimum: 1, maximum: 1025, example: 113 },
                    pokemonName: { type: "string", example: "Chansey" },
                    status: { type: "string", enum: ["empty", "owned"], example: "owned" },
                    priority: { type: "integer", minimum: 1, maximum: 5, example: 3 },
                    wishlist: { type: "string", example: "Alt art (JP) preferred" },
                    current: { oneOf: [{ $ref: "#/components/schemas/CardSnapshot" }, { type: "null" }] },
                    history: { type: "array", items: { $ref: "#/components/schemas/DexCardHistoryItem" } },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }
            },
            CreateDexCardBody: {
                type: "object",
                required: ["dex"],
                properties: {
                    dex: { type: "integer", minimum: 1, maximum: 1025 },
                    pokemonName: { type: "string" },
                    wishlist: { type: "string" },
                    priority: { type: "integer", minimum: 1, maximum: 5, default: 3 },
                    current: { oneOf: [{ $ref: "#/components/schemas/CardSnapshot" }, { type: "null" }] }
                }
            },
            ReplaceBody: {
                type: "object",
                required: ["current"],
                properties: { current: { $ref: "#/components/schemas/CardSnapshot" } }
            },
            PatchDexMetaBody: {
                type: "object",
                properties: {
                    wishlist: { type: "string" },
                    priority: { type: "integer", minimum: 1, maximum: 5 },
                    status: { type: "string", enum: ["empty", "owned"] },
                    pokemonName: { type: "string" }
                }
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    error: { type: "string", example: "ValidationError" },
                    message: { type: "string" },
                    details: { type: "object" }
                }
            }
        },
        parameters: {
            DexParam: {
                name: "dex",
                in: "path",
                required: true,
                schema: { type: "integer", minimum: 1, maximum: 1025 },
                description: "National Pokédex number"
            }
        }
    },
    paths: {
        "/health": {
            get: {
                tags: ["DexCards"],
                summary: "Health check",
                responses: { "200": { description: "OK" } }
            }
        },
        "/api/dex-cards": {
            get: {
                tags: ["DexCards"],
                summary: "List dex slots",
                parameters: [
                    { name: "owned", in: "query", schema: { type: "string", enum: ["true", "false"] }, description: "Filter by owned/empty" },
                    { name: "from", in: "query", schema: { type: "integer", minimum: 1 }, description: "Min dex" },
                    { name: "to", in: "query", schema: { type: "integer", maximum: 1025 }, description: "Max dex" }
                ],
                responses: {
                    "200": { description: "Array of DexCard", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/DexCard" } } } } }
                }
            },
            post: {
                tags: ["DexCards"],
                summary: "Create a single slot (if you don't use the seed endpoint)",
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateDexCardBody" } } } },
                responses: {
                    "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/DexCard" } } } },
                    "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            }
        },
        "/api/dex-cards/{dex}": {
            get: {
                tags: ["DexCards"],
                summary: "Get a single dex slot",
                parameters: [{ $ref: "#/components/parameters/DexParam" }],
                responses: {
                    "200": { description: "DexCard", content: { "application/json": { schema: { $ref: "#/components/schemas/DexCard" } } } },
                    "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            },
            patch: {
                tags: ["DexCards"],
                summary: "Update metadata (wishlist, priority, status, pokemonName)",
                parameters: [{ $ref: "#/components/parameters/DexParam" }],
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PatchDexMetaBody" } } } },
                responses: {
                    "200": { description: "Updated DexCard", content: { "application/json": { schema: { $ref: "#/components/schemas/DexCard" } } } },
                    "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            }
        },
        "/api/dex-cards/{dex}/replace": {
            put: {
                tags: ["DexCards"],
                summary: "Replace/upgrade the current card for this Pokémon",
                description: "If a current card exists, it is pushed to history; the new card becomes current and status=owned.",
                parameters: [{ $ref: "#/components/parameters/DexParam" }],
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ReplaceBody" } } } },
                responses: {
                    "200": { description: "Updated DexCard", content: { "application/json": { schema: { $ref: "#/components/schemas/DexCard" } } } },
                    "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
                    "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            }
        },
        "/api/dex-cards/{dex}/current": {
            delete: {
                tags: ["DexCards"],
                summary: "Clear the current card (moves it to history with reason=remove)",
                parameters: [{ $ref: "#/components/parameters/DexParam" }],
                responses: {
                    "204": { description: "Cleared" },
                    "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            }
        },
        "/api/dex-cards/admin/seed": {
            post: {
                tags: ["Admin"],
                summary: "Seed 1..1025 empty slots (idempotent, dev only)",
                responses: {
                    "200": {
                        description: "Seed result",
                        content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" }, count: { type: "integer", example: 1025 } } } } }
                    }
                }
            }
        }
    }
});
