# Project List Caching for Offline PWA Support

## Overview

The `ProjectList` is now cached in localStorage, allowing users to access their last downloaded project list even when offline or unable to connect to the NRG API.

## How It Works

### Automatic Caching

- When projects are successfully fetched from the API via `CollateJobs()`, the `ProjectList` is automatically saved to localStorage
- Each cache includes a timestamp showing when it was last updated
- The cache persists across browser sessions

### Automatic Loading

- On app initialization, if a cached project list exists, it's automatically loaded into the store
- Users see their last downloaded projects immediately, even before making an API call
- This provides a smooth offline experience

### Fallback Behavior

- **No API Key**: If no API key is available, the app attempts to load from cache
- **API Failure**: If the API call fails (e.g., network error, server down), the app falls back to cached data
- **No Cache**: If no cache exists and API fails, the app shows an empty list

## Components Involved

### `ProjectListCache.ts`

Static class that handles localStorage operations:

- `save(projectList)` - Saves projects to cache with timestamp
- `load()` - Retrieves cached projects
- `hasCache()` - Checks if cache exists
- `getCacheTimestamp()` - Gets when cache was last updated
- `getCacheAge()` - Gets cache age in milliseconds
- `clear()` - Clears the cache

### `jobs-state.ts` Updates

- `loadCachedProjects()` - Internal helper to load from cache
- Initializes store with cached data on startup
- Saves to cache after successful API fetch
- Falls back to cache on API failure
- Exposes `GetCacheInfo()` and `ClearCache()` methods

### `Refresh.vue` Updates

- Displays cache age indicator when cache exists
- Shows "📦 Cached X time ago" below project count
- Provides visual feedback about data freshness

## Usage for Users

### Normal Online Usage

1. User enters API key and clicks "Refresh Projects"
2. Projects are fetched from API and cached
3. Cache indicator shows "📦 Cached just now"

### Offline Usage

1. User opens app without internet connection
2. Last cached projects are automatically loaded
3. Cache indicator shows age: "📦 Cached 2 hours ago"
4. User can still view projects and use Google Maps directions

### Recovering from API Issues

1. API is temporarily unavailable
2. App attempts to fetch but fails
3. Automatically falls back to cached data
4. User can continue working with last known data

## Developer Notes

### Cache Structure

```typescript
// localStorage keys
"nrg-frontline-project-list" -> JSON stringified Job[]
"nrg-frontline-project-list-timestamp" -> ISO date string
```

### Cache Lifecycle

1. **Initialization**: Store loads cache on creation
2. **Update**: Cache saved after successful `CollateJobs()`
3. **Fallback**: Cache loaded when API unavailable
4. **Clear**: Cache can be cleared via `jobs$.ClearCache()`

### Future Enhancements

Consider adding:

- Manual "Clear Cache" button in UI
- Cache expiration policy (e.g., auto-clear after 7 days)
- Cache size monitoring
- Compression for large project lists
- IndexedDB for larger datasets (if localStorage size becomes an issue)

## Testing Offline Mode

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Reload app
5. Verify cached projects load

### Application Tab

1. Open DevTools → Application tab
2. Expand "Local Storage"
3. View `nrg-frontline-project-list` and `nrg-frontline-project-list-timestamp`
4. Can manually clear to test empty cache scenario

## Benefits

✅ **Offline Access** - Users can work without internet  
✅ **Fast Initial Load** - Cached data shows immediately  
✅ **Resilience** - App continues working during API outages  
✅ **Better UX** - No blank screens while loading  
✅ **PWA Standard** - Follows progressive enhancement principles
