# Adding New Features to NRG-Frontline

## Overview

This application uses a modular feature architecture where each feature is:
- Self-contained within its own directory
- Registered in the global app state
- Accessible through routing and navigation UI
- Displayed conditionally through the feature selection system

## Feature Architecture Components

### 1. **Feature State Management** (`app-state.ts`)
The central app state tracks the currently active feature through:
```typescript
const ActiveFeature = ref<
  | "data-mngt"
  | "workflow"
  | "labor-importer"
  | "route"
  | "test-api-key"
  | "project-pak-material-report-parser"
  | "playbook-editor"
  | null
>(null);
```

### 2. **Routing System** (`routes.ts`)
Routes are defined as Vue Router configurations mapping paths to feature components:
```typescript
{
  path: "/pbe-index",
  name: "pbe-playbook-index",
  component: PbeIndex,
}
```

### 3. **Feature Selection UI** (`FeatureSelection.vue`)
Displays buttons for users to activate features from the home screen.

### 4. **Navigation Footer** (`NavFooter.vue`)
Shows feature-specific footer buttons when a feature is active.

### 5. **Feature Footer Buttons** (e.g., `PbeFooterButtons.vue`)
Feature-specific navigation components that appear in the footer.

## Step-by-Step Guide to Adding a New Feature

### Step 1: Create Feature Directory Structure

Create your feature directory under `src/App/Views/Features/`:

```
src/App/Views/Features/
  YourNewFeature/
    YourFeatureMainView.vue
    YourFeatureFooterButtons.vue
    (additional components as needed)
```

### Step 2: Add Feature Type to App State

**File:** `src/Data/States/App/app-state.ts`

1. Add your feature name to the `ActiveFeature` ref type:
```typescript
const ActiveFeature = ref<
  | "data-mngt"
  | "workflow"
  | "labor-importer"
  | "route"
  | "test-api-key"
  | "project-pak-material-report-parser"
  | "playbook-editor"
  | "your-new-feature"  // <-- Add this
  | null
>(null);
```

2. Add it to the `setActiveFeature` function parameter type:
```typescript
const setActiveFeature = (
  feature:
    | "workflow"
    | "labor-importer"
    | "route"
    | "test-api-key"
    | "project-pak-material-report-parser"
    | "playbook-editor"
    | "your-new-feature"  // <-- Add this
    | null,
) => {
  ActiveFeature.value = feature;
};
```

### Step 3: Create Feature Components

#### Main Feature View Component (`YourFeatureMainView.vue`)
```vue
<template>
  <div class="your-feature-container">
    <h2>Your Feature Title</h2>
    <!-- Your feature content here -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppState } from '@/Data/States/App/app-state';

const app$ = useAppState();

onMounted(() => {
  app$.setActiveFeature('your-new-feature');
});
</script>

<style scoped lang="scss">
.your-feature-container {
  padding: 1rem;
}
</style>
```

#### Feature Footer Buttons (`YourFeatureFooterButtons.vue`)
```vue
<template>
  <div class="your-feature-footer">
    <n-button 
      class="footer-button" 
      :class="{ 'highlight-active': isYourFeatureRoute }" 
      size="small"
      @click="goToYourFeature" 
      aria-label="Your Feature">
      <span class="icon">🔧</span>
      <span class="label hide-on-mobile">Your Feature</span>
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const routeName = computed(() => route?.name as string | undefined);

const isYourFeatureRoute = computed(() => {
  return routeName.value === 'your-feature-main';
});

const goToYourFeature = () => router.push({ name: 'your-feature-main' });
</script>

<style scoped>
.your-feature-footer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.footer-button {
  height: 32px;
}

.footer-button .icon {
  display: inline-block;
  font-size: 1rem;
  line-height: 1;
}

.footer-button .label {
  margin-left: 0.35rem;
  font-size: 0.9rem;
}
</style>
```

### Step 4: Register Routes

**File:** `src/App/Infra/routes.ts`

1. Import your feature component at the top:
```typescript
import YourFeatureMainView from "../Views/Features/YourNewFeature/YourFeatureMainView.vue";
```

2. Add route configuration to the `routes` array:
```typescript
const routes = [
  // ... existing routes ...
  {
    path: "/your-feature",
    name: "your-feature-main",
    component: YourFeatureMainView,
  },
];
```

### Step 5: Add Feature Selection Button

**File:** `src/App/Views/Home/FeatureSelection.vue`

1. Add a button in the template:
```vue
<n-button 
  type="tertiary" 
  :ghost="false" 
  class="feature-button"
  :class="{ 'highlight-active': app$.ActiveFeature === 'your-new-feature' }" 
  @click="onLoadYourFeature">
  Your Feature Name
</n-button>
```

2. Add the handler function in the script section:
```typescript
const onLoadYourFeature = () => {
  app$.setActiveFeature('your-new-feature');
};
```

If your feature requires initialization (like fetching data):
```typescript
const onLoadYourFeature = async () => {
  app$.setActiveFeature('your-new-feature');
  await yourFeatureState$.initialize();
};
```

### Step 6: Add Footer Navigation Integration

**File:** `src/App/Views/AppLayout/NavFooter.vue`

1. Import your footer buttons component:
```typescript
import YourFeatureFooterButtons from '../Features/YourNewFeature/YourFeatureFooterButtons.vue';
```

2. Add a computed property to detect your feature routes:
```typescript
const isYourNewFeature = computed(() => {
  const name = routeName.value as string;
  return name === 'your-feature-main' || name?.startsWith('your-feature-');
});
```

3. Add the footer component to the template:
```vue
<YourFeatureFooterButtons
  v-if="app$.ActiveFeature === 'your-new-feature' || (app$.ActiveFeature === null && isYourNewFeature)" />
```

### Step 7: Create Feature Pinia Store

**File:** `src/Data/States/Features/YourFeatureState.ts`

Create a dedicated Pinia store using the composition API pattern:

```typescript
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAppState } from "../App/app-state";
import type { YourModel } from "@/Core/Models/your-feature/YourModel";

export const useYourFeatureState = defineStore("YourFeatureState", () => {
  const app$ = useAppState();

  // State
  const items = ref<YourModel[]>([]);
  const isLoading = ref(false);

  // Computed
  const hasItems = computed(() => items.value.length > 0);

  // Actions
  const fetchItems = async () => {
    isLoading.value = true;
    app$.setAppStatus("loading", "Loading items...");
    try {
      // TODO: Implement fetch logic
      app$.setAppStatus("success", "Items loaded successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      app$.setAppStatus("error", `Failed to load: ${message}`);
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    items.value = [];
    isLoading.value = false;
  };

  return {
    // State
    items,
    isLoading,

    // Computed
    hasItems,

    // Actions
    fetchItems,
    reset,
  };
});
```

Then import and use the store in your main view component:

```typescript
import { useYourFeatureState } from '@/Data/States/Features/YourFeatureState';

const yourFeature$ = useYourFeatureState();
```

### Step 8: Create Feature Models

**File:** `src/Core/Models/your-feature/YourModel.ts`

Define TypeScript interfaces for your feature's data structures:

```typescript
export interface YourModel {
  id: string;
  name: string;
  // Add other properties as needed
}

export interface YourModelCreateRequest {
  name: string;
}

export interface YourModelUpdateRequest {
  id: string;
  name?: string;
}
```

Keep models in `src/Core/Models/` to:
- Maintain separation between data structures and state management
- Allow reuse across multiple stores or components
- Keep the state files focused on behavior, not type definitions

### Step 9: Integrate with Data Backup

**File:** `src/App/Views/Home/DataBackup.vue`

Integrate your feature's state with the backup/restore system so users can save and load their data.

1. Import your feature's store:
```typescript
import { useYourFeatureState } from '@/Data/States/Features/YourFeatureState';

const yourFeature$ = useYourFeatureState();
```

2. Add your feature's state to `buildBackupPayload()`:
```typescript
stores: {
  // ... existing stores ...
  yourFeature: {
    items: yourFeature$.items,
    // Add other state properties to persist
  },
}
```

3. Restore your feature's state in `importData()`:
```typescript
if (stores.yourFeature) {
  yourFeature$.items = stores.yourFeature.items ?? [];
  // Restore other properties
}
```

4. Clear your feature's state in `handleConfirmClear()` (New Game):
```typescript
// Clear YourFeature
yourFeature$.reset();
```

5. (Optional) Add a summary line in the template:
```vue
<li>Items: {{ yourFeature$.items.length }}</li>
```

This ensures your feature's data is:
- Saved when user clicks "Save Game"
- Restored when user clicks "Load Game"
- Cleared when user clicks "New Game"

### Step 10: Create Feature Cache (Optional but Recommended)

**File:** `src/Data/Caches/App/Features/YourFeatureCache.ts`

Create a dedicated localStorage cache for automatic persistence that survives page refresh:

```typescript
import type { YourModel } from "@/Core/Models/your-feature/YourModel";

export class YourFeatureCache {
  private static readonly STORAGE_KEY = "nrg-frontline-your-feature";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-your-feature-timestamp";

  static save(items: YourModel[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
    } catch (error) {
      console.warn("[YourFeatureCache] Failed to save:", error);
    }
  }

  static load(): YourModel[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TIMESTAMP_KEY);
  }

  static hasCache(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  static getCacheTimestamp(): Date | null {
    const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  }
}
```

Then integrate the cache with your Pinia store:

```typescript
import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { YourFeatureCache } from "@/Data/Caches/App/Features/YourFeatureCache";
import type { YourModel } from "@/Core/Models/your-feature/YourModel";

export const useYourFeatureState = defineStore("YourFeatureState", () => {
  // Hydrate from cache on init
  const items = ref<YourModel[]>(YourFeatureCache.load());

  // Auto-persist on change
  watch(items, (newItems) => {
    YourFeatureCache.save(newItems);
  }, { deep: true });

  const reset = () => {
    items.value = [];
    YourFeatureCache.clear();
  };

  // ... rest of store
});
```

This provides:
- **Hydration**: Data loads from localStorage on store init
- **Auto-persist**: Changes automatically save via `watch`
- **Isolation**: Feature-specific localStorage key prevents collisions
- **Survives refresh**: Data persists without manual save/load

## Key Patterns and Best Practices

### 1. **Feature State Management**
- Create a dedicated Pinia store for your feature in `src/Data/States/YourFeature/`
- Follow the naming convention: `your-feature-state.ts`
- Use `defineStore` with composition API pattern

### 2. **Route Naming Convention**
- Use lowercase with hyphens: `your-feature-main`
- Prefix related routes: `your-feature-*` (e.g., `your-feature-settings`, `your-feature-detail`)

### 3. **Active Feature Detection**
The footer shows feature-specific buttons based on:
- **Primary:** `app$.ActiveFeature === 'your-feature'` (user selected from home)
- **Fallback:** `isYourNewFeature` computed (user directly navigated to route)

This dual-check ensures footer buttons show correctly whether:
- User clicks feature button from home (sets ActiveFeature)
- User directly navigates to a route via URL or refresh (falls back to route detection)

### 4. **Feature Isolation**
- Keep feature files in their own directory
- Don't directly import from other features
- Share common utilities through `src/Core/`

### 5. **Icon Selection**
Choose emoji icons for footer buttons that clearly represent your feature:
- 🔧 Tools/Configuration
- 📊 Reports/Analytics
- 📦 Packages/Bundles
- 🛠️ Workbench/Editor
- ♻️ Recycling/Recovery

### 6. **Initialization Pattern**
If your feature needs to load data on activation:
```typescript
const onLoadYourFeature = async () => {
  app$.setActiveFeature('your-new-feature');
  // Show loading indicator
  app$.showLoading();
  try {
    await yourFeatureState$.fetchInitialData();
  } finally {
    app$.hideLoading();
  }
};
```

## File Modification Checklist

When adding a new feature, modify these files in order:

- [ ] Create feature directory: `src/App/Views/Features/YourNewFeature/`
- [ ] Create main view component: `YourFeatureMainView.vue`
- [ ] Create footer buttons component: `YourFeatureFooterButtons.vue`
- [ ] Update `src/Data/States/App/app-state.ts` (add feature type)
- [ ] Update `src/App/Infra/routes.ts` (add routes)
- [ ] Update `src/App/Views/Home/FeatureSelection.vue` (add button)
- [ ] Update `src/App/Views/AppLayout/NavFooter.vue` (add footer integration)
- [ ] Create feature state: `src/Data/States/Features/YourFeatureState.ts`
- [ ] Create feature models: `src/Core/Models/your-feature/`
- [ ] Update `src/App/Views/Home/DataBackup.vue` (add backup/restore integration)
- [ ] Create feature cache: `src/Data/Caches/App/Features/YourFeatureCache.ts`

## Testing Your Feature

1. **Feature Selection:** Can you activate the feature from the home page?
2. **Routing:** Does the URL update correctly when navigating?
3. **Footer Buttons:** Do your footer buttons appear when the feature is active?
4. **Footer Highlighting:** Are active routes highlighted correctly?
5. **Direct Navigation:** If you refresh the page on a feature route, do footer buttons still appear?
6. **Feature State:** Is the `ActiveFeature` set correctly in the app state?

## Example: Playbook Editor Feature

The Playbook Editor is a complete example to reference:

**Structure:**
```
src/App/Views/Features/PlaybookEditor/
  PbeIndex.vue (main view)
  PbeEditor.vue (detail view)
  PbeRecycleBin.vue (additional view)
  PbeFooterButtons.vue (footer navigation)
```

**Routes:**
- `/pbe-index` → `pbe-playbook-index`
- `/pbe-playbook-editor` → `pbe-playbook-editor`
- `/pbe-recycle-bin` → `pbe-playbook-recycle-bin`

**Footer Logic:**
```typescript
const isPlaybookConfigRoute = computed(() => {
  return (
    routeName.value === 'pbe-playbook-index' ||
    routeName.value === 'pbe-playbook-editor' ||
    routeName.value === 'pbe-playbook-recycle-bin'
  );
});
```

**Footer Display:**
```vue
<PlaybookEditorFooterButtons
  v-if="app$.ActiveFeature === 'playbook-editor' || (app$.ActiveFeature === null && isPlaybookEditor)" />
```

## Common Issues and Solutions

### Issue: Footer buttons don't appear after page refresh
**Solution:** Ensure you have both conditions in NavFooter.vue:
```vue
v-if="app$.ActiveFeature === 'your-feature' || (app$.ActiveFeature === null && isYourFeature)"
```

### Issue: TypeScript errors when adding feature type
**Solution:** Add the feature string to BOTH the `ActiveFeature` ref type AND the `setActiveFeature` parameter type.

### Issue: Router navigation doesn't work
**Solution:** Verify the route name matches exactly between routes.ts and your navigation calls.

### Issue: Feature button doesn't highlight on home page
**Solution:** Ensure the class binding matches: `:class="{ 'highlight-active': app$.ActiveFeature === 'your-feature' }"`

## Additional Resources

- **Naive UI Components:** https://www.naiveui.com/
- **Vue Router:** https://router.vuejs.org/
- **Pinia State Management:** https://pinia.vuejs.org/

---

*Last Updated: March 24, 2026*
