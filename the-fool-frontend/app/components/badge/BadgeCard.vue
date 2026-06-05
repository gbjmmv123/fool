<script setup lang="ts">
import type { BadgeConfig } from '~/composables/useBadgeConfig'
import { BADGE_STATIC } from '~/composables/useBadgeConfig'
import { BADGE_COPY, MODAL } from '~/data/copy'

const props = defineProps<{
  config: BadgeConfig
  avatarUrl: string
}>()

function hexToRgba(hex: string, alpha: number) {
  const m = hex.trim().replace('#', '')
  const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m
  if (!/^[\da-fA-F]{6}$/.test(full)) return `rgba(240,112,16,${alpha})`
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const cardStyle = computed(() => ({
  '--theme-color': props.config.themeColor,
  '--theme-shadow-color': hexToRgba(props.config.themeColor, 0.2),
  '--theme-soft-color': hexToRgba(props.config.themeColor, 0.12),
  '--theme-outline-color': hexToRgba(props.config.themeColor, 0.28),
  '--footer-text-color': BADGE_COPY.footerTextColor,
  '--id-color': BADGE_COPY.idColor,
} as Record<string, string>))

const avatarStyle = computed(() => ({
  backgroundImage: `url("${props.avatarUrl}")`,
}))
</script>

<template>
  <section
    class="badge-card"
    :style="cardStyle"
    :aria-label="MODAL.badgeCardAriaLabel"
  >
    <div class="badge-slot" aria-hidden="true" />
    <div class="badge-band" aria-hidden="true" />

    <header class="badge-header">
      <p class="badge-brand">{{ BADGE_COPY.brandText }}</p>
      <p class="badge-brand-sub">{{ BADGE_COPY.brandSubText }}</p>
    </header>

    <div class="badge-avatar-wrap">
      <div class="badge-avatar">
        <div class="badge-avatar-photo" :style="avatarStyle" aria-hidden="true" />
      </div>
    </div>

    <section class="badge-info">
      <h1 class="badge-name">{{ config.name }}</h1>
      <p class="badge-role">{{ config.role }}</p>
    </section>

    <footer class="badge-footer">
      <span class="badge-id">{{ config.idText }}</span>
      <span class="badge-footer-brand">{{ BADGE_COPY.footerBrand }}</span>
    </footer>
  </section>
</template>

<style scoped>
.badge-card {
  position: relative;
  width: 276px;
  aspect-ratio: 0.58;
  overflow: hidden;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
  color: #2d2d2d;
  flex-shrink: 0;
}

.badge-slot {
  position: absolute;
  top: 28px;
  left: 50%;
  z-index: 3;
  width: 80px;
  height: 16px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(180deg, #bdbdbd 0%, #dcdcdc 100%);
}

.badge-band {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 88px;
  background: var(--theme-color, #f07010);
  clip-path: polygon(0 32%, 100% 0%, 100% 100%, 0 100%);
}

.badge-header {
  position: relative;
  z-index: 2;
  padding: 60px 20px 0;
}

.badge-brand {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.2px;
  color: #2f2f2f;
}

.badge-brand-sub {
  margin: 3px 0 0;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: var(--theme-color, #ee6f11);
}

.badge-avatar-wrap {
  position: relative;
  z-index: 2;
  width: 188px;
  height: 188px;
  margin: 16px auto 0;
}

.badge-avatar {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
}

.badge-avatar-photo {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  transform: scale(1.3);
}

.badge-info {
  position: relative;
  z-index: 2;
  margin-top: 24px;
  text-align: center;
}

.badge-name {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 1px;
  color: #303030;
}

.badge-role {
  display: inline-block;
  margin: 10px 0 0;
  padding: 0 3px 3px;
  border-bottom: 1px solid var(--theme-color, #ee6f11);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.8px;
  color: var(--theme-color, #ee7616);
}

.badge-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 22px 18px;
  color: var(--footer-text-color, #fffaf4);
}

.badge-id {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: var(--id-color, #fffaf4);
}

.badge-footer-brand {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.8px;
}
</style>
