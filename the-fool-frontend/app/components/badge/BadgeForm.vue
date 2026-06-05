<script setup lang="ts">
import { BADGE_COPY } from '~/data/copy'
import type { BadgeConfig } from '~/composables/useBadgeConfig'
import { DEPARTMENT_DATA } from '~/data/departments'

const props = defineProps<{
  config: BadgeConfig
  exporting: boolean
}>()

const emit = defineEmits<{
  'pick-avatar': []
  'use-preset-avatar': [url: string]
  'reset': []
  'save': []
}>()

const EXTRA_PRESETS = [
  { id: 'zhou', name: '周明瑞（愚者）', color: '#f07010', avatarUrl: '/static/avatars/artist-zhou.png' },
  { id: 'amon', name: '阿蒙（恋人）', color: '#3c6560', avatarUrl: '/static/avatars/amon.png' },
]

const presetAvatars = [
  ...EXTRA_PRESETS,
  ...Object.values(DEPARTMENT_DATA).map(d => ({
    id: d.id,
    name: d.name,
    color: d.themeColor.length === 9 ? d.themeColor.slice(0, 7) : d.themeColor,
    avatarUrl: d.officer.avatar,
  })),
]

const colorSuggestions = [
  ...EXTRA_PRESETS.map(a => ({ name: a.name, color: a.color })),
  ...Object.values(DEPARTMENT_DATA).map(d => ({
    name: d.name,
    color: d.themeColor.length === 9 ? d.themeColor.slice(0, 7) : d.themeColor,
  })),
]

const selectedAvatarId = ref('zhou')

function selectPresetAvatar(preset: typeof presetAvatars[0]) {
  selectedAvatarId.value = preset.id
  props.config.themeColor = preset.color
  emit('use-preset-avatar', preset.avatarUrl)
}

function handleReset() {
  selectedAvatarId.value = 'zhou'
  emit('reset')
}

const showColorPicker = ref(false)

function applyColor(color: string, setter: (v: string) => void) {
  setter(color)
  showColorPicker.value = false
}
</script>

<template>
  <div class="badge-form">
    <section class="bf-section">
      <h3 class="bf-section-title">头像</h3>
      <div class="bf-dept-avatars">
        <button
          v-for="preset in presetAvatars"
          :key="preset.id"
          class="bf-dept-avatar-btn"
          :class="{ 'is-selected': selectedAvatarId === preset.id }"
          :style="{ '--dept-color': preset.color }"
          type="button"
          :title="preset.name"
          @click="selectPresetAvatar(preset)"
        >
          <img :src="preset.avatarUrl" :alt="preset.name" class="bf-dept-avatar-img" />
        </button>
      </div>
      <div class="bf-avatar-row">
        <button class="btn" type="button" @click="$emit('pick-avatar')">上传头像</button>
      </div>
    </section>

    <section class="bf-section">
      <h3 class="bf-section-title">文案</h3>
      <label class="bf-field">
        <span class="bf-label">姓名</span>
        <input v-model="config.name" class="bf-input" type="text" maxlength="12">
      </label>
      <label class="bf-field">
        <span class="bf-label">职位</span>
        <input v-model="config.role" class="bf-input" type="text" maxlength="20">
      </label>
      <label class="bf-field">
        <span class="bf-label">底部 ID</span>
        <input v-model="config.idText" class="bf-input" type="text" maxlength="32">
      </label>
    </section>

    <section class="bf-section">
      <div class="bf-section-head">
        <h3 class="bf-section-title">主题色</h3>
        <button
          type="button"
          class="bf-suggest-toggle"
          :aria-expanded="showColorPicker"
          @click="showColorPicker = !showColorPicker"
        >
          {{ showColorPicker ? '收起建议' : '颜色建议' }}
          <span class="bf-suggest-arrow" :class="{ 'is-open': showColorPicker }" aria-hidden="true">▾</span>
        </button>
      </div>

      <label class="bf-field bf-field--row">
        <input v-model="config.themeColor" class="bf-color" type="color">
        <input v-model="config.themeColor" class="bf-input" type="text" maxlength="7">
      </label>

      <div v-if="showColorPicker" class="bf-suggest-list">
        <div
          v-for="item in colorSuggestions"
          :key="item.name"
          class="bf-suggest-row"
        >
          <span class="bf-suggest-swatch" :style="{ background: item.color }" aria-hidden="true" />
          <span class="bf-suggest-name">{{ item.name }}</span>
          <span class="bf-suggest-hex">{{ item.color }}</span>
          <button
            type="button"
            class="bf-suggest-apply"
            :class="{ 'is-active': config.themeColor.toLowerCase() === item.color.toLowerCase() }"
            @click="applyColor(item.color, v => (config.themeColor = v))"
          >
            {{ config.themeColor.toLowerCase() === item.color.toLowerCase() ? '已选' : '使用' }}
          </button>
        </div>
      </div>
    </section>

    <div class="bf-actions">
      <button class="btn" type="button" @click="handleReset">重置</button>
      <button
        class="btn btn--primary"
        type="button"
        :disabled="exporting"
        @click="$emit('save')"
      >
        {{ exporting ? '保存中…' : '保存图片' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.badge-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.bf-section {
  padding: 1rem 1.1rem;
  border: 1px solid var(--dt-border-subtle);
  border-radius: var(--dt-radius-card);
  background: var(--dt-bg-elevated);
}

.bf-section-title {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dt-text-title);
  letter-spacing: 0.04em;
}

.bf-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.bf-section-head .bf-section-title {
  margin: 0;
}

.bf-suggest-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--dt-text-muted);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.bf-suggest-toggle:hover {
  color: var(--dt-text-body);
  border-color: var(--dt-border-default);
}

.bf-suggest-arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}

.bf-suggest-arrow.is-open {
  transform: rotate(180deg);
}

.bf-suggest-list {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
  max-height: 280px;
  overflow-y: auto;
}

.bf-suggest-row {
  display: grid;
  grid-template-columns: 18px 1fr auto auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.bf-suggest-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.bf-suggest-swatch {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.bf-suggest-name {
  font-size: 0.85rem;
  color: var(--dt-text-body);
}

.bf-suggest-hex {
  font-size: 0.72rem;
  color: var(--dt-text-muted);
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  letter-spacing: 0.02em;
}

.bf-suggest-apply {
  padding: 0.25rem 0.65rem;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--dt-text-body);
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bf-suggest-apply:hover {
  border-color: var(--dt-border-default);
  color: var(--dt-text-title);
}

.bf-suggest-apply.is-active {
  background: rgba(212, 184, 134, 0.15);
  border-color: var(--dt-border-default);
  color: var(--dt-border-default);
  cursor: default;
}

.bf-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.bf-field + .bf-field {
  margin-top: 0.75rem;
}

.bf-field--row {
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
}

.bf-label {
  font-size: 0.75rem;
  color: var(--dt-text-muted);
  letter-spacing: 0.04em;
}

.bf-input {
  width: 100%;
  height: 40px;
  padding: 0 0.75rem;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--dt-text-body);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.bf-input:focus {
  border-color: var(--dt-border-default);
}

.bf-color {
  flex: 0 0 44px;
  width: 44px;
  height: 40px;
  padding: 2px;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
}

.bf-avatar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.bf-dept-avatars {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.bf-dept-avatar-btn {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--dept-color, currentColor) 20%, transparent);
  background: rgba(255, 255, 255, 0.04);
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.bf-dept-avatar-btn:hover {
  transform: scale(1.08);
  border-color: color-mix(in srgb, var(--dept-color) 55%, transparent);
}

.bf-dept-avatar-btn:active {
  transform: scale(0.96);
}

.bf-dept-avatar-btn.is-selected {
  border-color: var(--dept-color);
}

.bf-dept-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bf-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.btn--primary {
  background: rgba(212, 184, 134, 0.15);
  border-color: var(--dt-border-default);
  color: var(--dt-border-default);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
