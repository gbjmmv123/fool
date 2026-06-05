<script setup lang="ts">
import { PAGE_META, SITE_COPY } from '~/data/copy'
definePageMeta({
  title: PAGE_META.site,
  showTopNav: true,
})

const tosExpanded = ref(false)

const qqs = [
  { name: '世元', qq: '1077227247' },
  { name: '小锅', qq: '1795037851' },
]

async function copyQQ(qq: string) {
  try {
    await navigator.clipboard.writeText(qq)
  } catch {
    // fallback
  }
}
</script>

<template>
  <MainContent :title="SITE_COPY.title">
    <div class="about-site">

      <!-- 1. 联系我们 -->
      <section class="site-section site-section--contact">
        <h2 class="site-section__title">{{ SITE_COPY.sectionContact }}</h2>
        <div class="site-section__body">
          <div v-for="c in qqs" :key="c.qq" class="contact-item">
            <span class="contact-item__name">{{ c.name }}</span>
            <span class="contact-item__qq">{{ SITE_COPY.contactQQPrefix }}{{ c.qq }}</span>
            <button class="contact-item__copy" @click="copyQQ(c.qq)">{{ SITE_COPY.contactCopy }}</button>
          </div>
        </div>
      </section>

      <!-- 2. 用户服务协议 -->
      <section class="site-section site-section--tos">
        <button class="site-section__title site-section__title--toggle" @click="tosExpanded = !tosExpanded">
          <span>{{ SITE_COPY.sectionAgreement }}</span>
          <svg
            class="toggle-arrow"
            :class="{ 'is-open': tosExpanded }"
            width="16" height="16" viewBox="0 0 16 16" fill="none"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div v-if="tosExpanded" class="site-section__body site-section__body--tos">
          <p v-for="(para, i) in SITE_COPY.disclaimer" :key="i">{{ para }}</p>

          <h4>{{ SITE_COPY.section1Title }}</h4>
          <p v-for="(para, i) in SITE_COPY.section1" :key="i">{{ para }}</p>

          <h4>{{ SITE_COPY.section2Title }}</h4>
          <p v-for="(para, i) in SITE_COPY.section2" :key="i">{{ para }}</p>

          <h4>{{ SITE_COPY.section3Title }}</h4>
          <p v-for="(para, i) in SITE_COPY.section3" :key="i">{{ para }}</p>

          <h4>{{ SITE_COPY.section4Title }}</h4>
          <p v-for="(para, i) in SITE_COPY.section4" :key="i">{{ para }}</p>

          <h4>{{ SITE_COPY.section5Title }}</h4>
          <p v-for="(para, i) in SITE_COPY.section5" :key="i">{{ para }}</p>

          <h4>{{ SITE_COPY.section6Title }}</h4>
          <p v-for="(para, i) in SITE_COPY.section6" :key="i">{{ para }}</p>
          <p class="site-section__closing">{{ SITE_COPY.disclaimerClosing }}</p>
        </div>
      </section>

      <!-- 3. 制作组碎碎念 -->
      <section class="site-section site-section--dev">
        <h2 class="site-section__title">{{ SITE_COPY.sectionDevNote }}</h2>
        <div class="site-section__body">
          <p v-for="(para, i) in SITE_COPY.devNote" :key="i">{{ para }}</p>
          <p class="site-section__closing">{{ SITE_COPY.devNoteClosing }}</p>
        </div>
      </section>

    </div>
  </MainContent>
</template>

<style scoped>
.about-site {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.site-section {
  border: 1px solid var(--dt-border-subtle);
  border-radius: var(--dt-radius-card, 12px);
  background: var(--dt-bg-elevated);
  box-shadow: var(--dt-shadow-card, 0 2px 12px rgba(0,0,0,0.3));
  overflow: hidden;
}

.site-section__title {
  margin: 0;
  padding: 1.25rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--dt-text-title);
  border-bottom: 1px solid rgba(212, 184, 134, 0.08);
  letter-spacing: 0.06em;
}

.site-section__title--toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(212, 184, 134, 0.08);
  text-align: left;
  transition: color 0.2s ease;
}

.site-section__title--toggle:hover {
  color: var(--dt-border-highlight);
}

.toggle-arrow {
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
}

.toggle-arrow.is-open {
  transform: rotate(180deg);
}

.site-section__body {
  padding: 1.25rem 1.5rem;
  color: var(--dt-text-body);
  line-height: 1.85;
  font-size: 0.9rem;
}

.site-section__body p {
  margin: 0 0 0.85rem;
}

.site-section__body p:last-child {
  margin-bottom: 0;
}

.site-section__body h4 {
  margin: 1.25rem 0 0.5rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--dt-text-title);
}

.site-section__body h4:first-child {
  margin-top: 0;
}

.site-section__closing {
  text-align: center;
  color: var(--dt-text-muted);
  font-style: italic;
}

.site-section__body--tos {
  border-top: none;
}

/* ── Contact items ── */
.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.contact-item + .contact-item {
  border-top: 1px solid rgba(212, 184, 134, 0.05);
}

.contact-item__name {
  font-weight: 500;
  color: var(--dt-text-title);
  min-width: 2.5rem;
}

.contact-item__qq {
  color: var(--dt-text-muted);
  font-size: 0.85rem;
  flex: 1;
}

.contact-item__copy {
  padding: 0.25rem 0.75rem;
  border: 1px solid rgba(212, 184, 134, 0.25);
  border-radius: 6px;
  background: rgba(212, 184, 134, 0.06);
  color: var(--dt-text-muted);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.contact-item__copy:hover {
  background: rgba(212, 184, 134, 0.15);
  color: var(--dt-text-title);
  border-color: rgba(212, 184, 134, 0.45);
}

/* ── Entrance animation ── */
.site-section--dev {
  animation: sectionIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes sectionIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-section--dev {
    animation: none;
  }
}
</style>