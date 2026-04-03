<template>
  <n-modal v-model:show="showModal" preset="card" style="width: 95vw; height: 90vh;" title="Add Note">
    <div class="note-editor">
      <div class="toolbar">
        <button
          class="toolbar-button"
          :class="{ active: editor?.isActive('bold') }"
          @click="editor?.chain().focus().toggleBold().run()"
          title="Bold"
        ><strong>B</strong></button>
        <button
          class="toolbar-button"
          :class="{ active: editor?.isActive('italic') }"
          @click="editor?.chain().focus().toggleItalic().run()"
          title="Italic"
        ><em>I</em></button>
        <span class="divider" />
        <button
          class="toolbar-button"
          :class="{ active: editor?.isActive('heading', { level: 1 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          title="Heading 1"
        ><strong>H1</strong></button>
        <button
          class="toolbar-button"
          :class="{ active: editor?.isActive('heading', { level: 2 }) }"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          title="Heading 2"
        ><strong>H2</strong></button>
        <span class="divider" />
        <button
          class="toolbar-button"
          :class="{ active: editor?.isActive('bulletList') }"
          @click="editor?.chain().focus().toggleBulletList().run()"
          title="Bullet list"
        >•</button>
        <button
          class="toolbar-button"
          :class="{ active: editor?.isActive('orderedList') }"
          @click="editor?.chain().focus().toggleOrderedList().run()"
          title="Numbered list"
        >1.</button>
        <span class="divider" />
        <button
          class="toolbar-button"
          :class="{ active: editor?.isActive('link') }"
          @click="setLink"
          title="Add link"
        >🔗</button>
        <button
          class="toolbar-button"
          @click="editor?.chain().focus().unsetLink().run()"
          title="Remove link"
        >⛓️‍💥</button>
      </div>
      <editor-content :editor="editor" class="editor-content" />
    </div>
    <template #footer>
      <n-space justify="end">
        <n-button size="small" @click="handleCancel">Cancel</n-button>
        <n-button size="small" type="primary" @click="handleSave">Save Note</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

const props = defineProps<{
  show: boolean;
  tenantId: string;
  tenantName: string;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'save', tenantId: string, html: string): void;
}>();

const showModal = ref(props.show);

watch(() => props.show, (val) => {
  showModal.value = val;
  if (val && editor.value) {
    editor.value.commands.clearContent();
  }
});

watch(showModal, (val) => {
  emit('update:show', val);
});

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
    }),
  ],
  content: '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm focus:outline-none',
    },
  },
});

const setLink = () => {
  const url = window.prompt('Enter URL:');
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run();
  }
};

const handleCancel = () => {
  showModal.value = false;
};

const handleSave = () => {
  const html = editor.value?.getHTML() ?? '';
  if (html && html !== '<p></p>') {
    emit('save', props.tenantId, html);
    showModal.value = false;
  }
};

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.note-editor {
  border: 1px solid var(--n-border-color);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(90vh - 130px);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background: var(--n-color-embedded);
  border-bottom: 1px solid var(--n-border-color);
}

.toolbar-button {
  border: 1px solid var(--n-border-color);
  background: var(--n-color);
  border-radius: 4px;
  padding: 4px;
  width: 28px;
  height: 28px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--n-text-color);
}

.toolbar-button:hover {
  background: var(--n-color-hover);
}

.toolbar-button.active {
  background: var(--n-color-pressed);
  border-color: var(--n-color-focus);
}

.divider {
  width: 1px;
  background: var(--n-border-color);
  margin: 0 4px;
}

.editor-content {
  flex: 1;
  padding: 12px;
  background: var(--n-color);
  overflow-y: auto;
}

.editor-content :deep(.ProseMirror) {
  min-height: 100%;
  outline: none;
}

.editor-content :deep(.ProseMirror p) {
  margin: 0 0 0.5em 0;
}

.editor-content :deep(.ProseMirror h1),
.editor-content :deep(.ProseMirror h2),
.editor-content :deep(.ProseMirror h3) {
  margin: 0.5em 0 0.25em 0;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.editor-content :deep(.ProseMirror a) {
  color: var(--n-color-target);
  text-decoration: underline;
}
</style>
