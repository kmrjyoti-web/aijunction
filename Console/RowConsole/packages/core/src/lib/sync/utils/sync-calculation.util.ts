
export interface SyncMetaData {
    id: string; // Using string to map to Table Name (e.g. 'ROW_CONTACT')
    total_records: number; // Server total
    current_data_total: number; // How many we have locally
    page_size: number; // Last used page size
    page_number: number; // Next page to fetch (or last fetched)
    updated_at: number; // Timestamp
}

export interface SyncCalculationResult {
    shouldSync: boolean;
    nextPageNumber: number;
    nextPageSize: number;
    expectedRemaining: number;
}

/**
 * Calculates the next step in the synchronization process based on current metadata.
 * 
 * Logic:
 * 1. Checks if current local records < total server records.
 * 2. Determines the next page number based on the desired page size (500).
 * 3. Handles the initial case where no metadata exists.
 */
export function calculateNextSyncStep(
    meta: SyncMetaData | undefined,
    serverTotal: number = -1
): SyncCalculationResult {
    const DEFAULT_PAGE_SIZE = 50;
    const INITIAL_PAGE_SIZE = 30; // Fast initial load

    // Case 0: No metadata yet (clean slate) - Fetch first 30
    if (!meta) {
        return {
            shouldSync: true,
            nextPageNumber: 1,
            nextPageSize: INITIAL_PAGE_SIZE,
            expectedRemaining: serverTotal === -1 ? 9999 : serverTotal
        };
    }

    const currentCount = meta.current_data_total || 0;
    const knownTotal = serverTotal !== -1 ? serverTotal : meta.total_records;

    // Case 1: Initial load done (30 records), now switch to bulk string
    // If we have less than full set, and we just did the initial load
    // The previous page_size would be 30.
    // We want to fetch the REST.
    // However, fetching "Page 2" of size 500 will skip records 501-1000.
    // We have records 1-30.
    // Use Offset logic: We have 30 records. We want records starting from offset 30.
    // Variable Page Size is tricky with standard Paging API (Page N of Size M).
    // API: GetAll(page_number, page_size) -> returns data at offset (page-1)*size.

    // Approach:
    // Sync 1: Page 1, Size 30. (Records 0-29). Data Count = 30.
    // Sync 2: We want records 30+.
    // If we rely on standard paging, we must use a page size that aligns or use 'skip' params.
    // If API supports `skip`/`take`, perfect.
    // User API has `page_number` and `page_size`.
    // If we change PageSize to 500.
    // Page 1 (0-499). We already have 0-29. This overlaps.
    // We could just re-fetch Page 1 with Size 500? And overwrite the 30?
    // This is the simplest robust way.

    // Refined Logic for "Smart Sync":
    // If current count < knownTotal:
    // Calculate page = floor(currentCount / 500) + 1.
    // Case A: current = 30. 30/500 = 0. Page = 1.
    // Fetch Page 1, Size 500.
    // This fetches 0-499. Overwrites 0-29. Adds 30-499.
    // This is acceptable overhead for simplicity.

    // Case B: current = 500. 500/500 = 1. Page = 2.
    // Fetch Page 2, Size 500 (500-999).

    if (currentCount >= knownTotal && knownTotal > 0) {
        return {
            shouldSync: false,
            nextPageNumber: -1,
            nextPageSize: 0,
            expectedRemaining: 0
        };
    }

    const nextPage = Math.floor(currentCount / DEFAULT_PAGE_SIZE) + 1;

    return {
        shouldSync: true,
        nextPageNumber: nextPage,
        nextPageSize: DEFAULT_PAGE_SIZE,
        expectedRemaining: knownTotal - currentCount
    };
}
