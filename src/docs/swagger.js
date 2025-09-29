
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
        { name: "Admin", description: "Dev/seed helpers (not for production)" },
        { name: "Pokemon", description: "Manage Pokemon names" }
    ],
    components: {
        securitySchemes: {
            cookieAuth: { type: "apiKey", in: "cookie", name: "connect.sid", description: "Session cookie set after Google OAuth" }
        },
        schemas: {
            Pokemon: {
                type: "object",
                properties: {
                    dex: { type: "integer", minimum: 1, maximum: 1025, example: 25 },
                    name: { type: "string", example: "Pikachu" },
                    types: { type: "array", items: { type: "string" }, example: ["electric"] },
                    generation: { type: "integer", example: 1 },
                    spriteUrl: { type: "string", format: "uri" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }

            },
            CreatePokemonBody: {
                type: "object",
                required: ["dex", "name"],
                properties: {
                    dex: { type: "integer", minimum: 1, maximum: 1025 },
                    name: { type: "string" },
                    types: { type: "array", items: { type: "string" } },
                    generation: { type: "integer" },
                    spriteUrl: { type: "string", format: "uri" }
                }
            },
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
                tags: ["Admin"],
                security: [{ cookieAuth: [] }],
                summary: "Health check",
                responses: { "200": { description: "OK" } }
            }
        },
        "/api/dex-cards": {
            get: {
                tags: ["DexCards"],
                summary: "List dex slots",
                security: [{ cookieAuth: [] }],
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
                security: [{ cookieAuth: [] }],
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
                security: [{ cookieAuth: [] }],
                summary: "Get a single dex slot",
                parameters: [{ $ref: "#/components/parameters/DexParam" }],
                responses: {
                    "200": { description: "DexCard", content: { "application/json": { schema: { $ref: "#/components/schemas/DexCard" } } } },
                    "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
                }
            },
            patch: {
                tags: ["DexCards"],
                security: [{ cookieAuth: [] }],
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
                security: [{ cookieAuth: [] }],
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
                security: [{ cookieAuth: [] }],
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
                security: [{ cookieAuth: [] }],
                summary: "Seed 1..1025 empty slots (idempotent, dev only)",
                responses: {
                    "200": {
                        description: "Seed result",
                        content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" }, count: { type: "integer", example: 1025 } } } } }
                    }
                }
            }
        },
        "/api/pokemon": {
            get: {
                tags: ["Pokemon"],
                security: [{ cookieAuth: [] }],
                summary: "List Pokémon (reference collection)",
                parameters: [
                    { in: "query", name: "name", schema: { type: "string" }, description: "substring match" },
                    { in: "query", name: "type", schema: { type: "string" }, description: "filter by type" },
                    { in: "query", name: "from", schema: { type: "integer" } },
                    { in: "query", name: "to", schema: { type: "integer" } }
                ],
                responses: {
                    "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Pokemon" } } } } }
                }
            },
            post: {
                tags: ["Pokemon"],
                security: [{ cookieAuth: [] }],
                summary: "Create a Pokémon record",
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePokemonBody" } } } },
                responses: {
                    "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Pokemon" } } } },
                    "400": { description: "Validation error" },
                    "409": { description: "Duplicate dex" }
                }
            }
        },
        "/api/pokemon/{dex}": {
            get: {
                tags: ["Pokemon"],
                security: [{ cookieAuth: [] }],
                summary: "Get a Pokémon by dex",
                parameters: [{ $ref: "#/components/parameters/DexParam" }],
                responses: {
                    "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Pokemon" } } } },
                    "404": { description: "Not found" }
                }
            },
            put: {
                tags: ["Pokemon"],
                security: [{ cookieAuth: [] }],
                summary: "Update a Pokémon by dex",
                parameters: [{ $ref: "#/components/parameters/DexParam" }],
                requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreatePokemonBody" } } } },
                responses: {
                    "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Pokemon" } } } },
                    "400": { description: "Validation error" },
                    "404": { description: "Not found" }
                }
            },
            delete: {
                tags: ["Pokemon"],
                security: [{ cookieAuth: [] }],
                summary: "Delete a Pokémon by dex",
                parameters: [{ $ref: "#/components/parameters/DexParam" }],
                responses: { "204": { description: "Deleted" }, "404": { description: "Not found" } }
            }
        },
        "/auth/github": { get: { tags: ["Auth"], summary: "Start Github OAuth", responses: { "302": { description: "Redirect to Github" } } } },
        "/auth/me": { get: { tags: ["Auth"], summary: "Current user", responses: { "200": { description: "User or 401 if not logged in" } } } },
        "/auth/logout": { post: { tags: ["Auth"], summary: "Logout (clear session)", responses: { "204": { description: "No Content" } } } }


    }
});
