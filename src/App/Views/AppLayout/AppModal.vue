<template>
  <n-flex vertical :size="16">
    <!-- Most Recent Status - Large Display -->
    <div class="status-header">
      <span class="status-icon" :class="app$.AppStatus.kind">
        {{ APP_STATUS_GLYPHS[app$.AppStatus.kind] }}
      </span>
      <div class="status-info">
        <div class="status-kind">{{ app$.AppStatus.kind.toUpperCase() }}</div>
        <div class="status-message">{{ app$.AppStatus.message }}</div>
      </div>
    </div>

    <n-divider />

    <!-- History - Last 5 Calls -->
    <div class="status-history">
      <div class="history-title">Recent Activity</div>
      <n-space vertical :size="8">
        <div v-if="app$.AppStatusHistory.length === 0" class="history-empty">
          No activity recorded yet
        </div>
        <div v-for="(status, index) in app$.AppStatusHistory.slice(0, 5)" :key="index" class="history-item">
          <span class="history-icon" :class="status.kind">
            {{ APP_STATUS_GLYPHS[status.kind] }}
          </span>
          <div class="history-details">
            <span class="history-kind">{{ status.kind }}</span>
            <span class="history-message">{{ status.message }}</span>
          </div>
          <span class="history-time">{{ formatTime(status.since) }}</span>
        </div>
      </n-space>
    </div>
  </n-flex>
</template>

<script setup lang="ts">
import { useAppState } from '@/Core/States/app-state';
import { APP_STATUS_GLYPHS } from '@/Core/Models/infra/AppStatus';
import { NSpace, NDivider, NFlex, NText } from 'naive-ui';
import { computed, watch } from 'vue';

const app$ = useAppState();

// Debug: log whenever AppStatusHistory changes
watch(() => app$.AppStatusHistory, (newVal) => {
  console.log('[AppModal] AppStatusHistory updated:', newVal);
}, { deep: true });

const historyItems = computed(() => {
  console.log('[AppModal] Computing history items, current history:', app$.AppStatusHistory);
  return app$.AppStatusHistory;
});

const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleTimeString();
};
</script>

<style scoped>
.status-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.status-icon {
  font-size: 2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;

  &.loading {
    color: var(--status-loading);
    background: rgba(255, 167, 38, 0.1);
    animation: spin 1s linear infinite;
  }

  &.success {
    color: var(--status-success);
    background: rgba(34, 197, 94, 0.1);
  }

  &.error {
    color: var(--status-error);
    background: rgba(239, 68, 68, 0.1);
  }

  &.idle {
    color: var(--status-idle);
    background: rgba(156, 163, 175, 0.1);
  }
}

.status-info {
  flex: 1;
}

.status-kind {
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: capitalize;
}

.status-message {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
  word-break: break-word;
}

.status-history {
  margin-top: 8px;
}

.history-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
  font-weight: 600;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.history-icon {
  font-size: 1rem;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.loading {
    color: var(--status-loading);
    animation: spin 1s linear infinite;
  }

  &.success {
    color: var(--status-success);
  }

  &.error {
    color: var(--status-error);
  }

  &.idle {
    color: var(--status-idle);
  }
}

.history-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.history-kind {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.7;
  letter-spacing: 0.3px;
}

.history-message {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  flex-shrink: 0;
}

.history-empty {
  padding: 24px 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
