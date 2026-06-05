<script setup lang="ts">
interface Props {
  label: string
  to: string
  badge?: number
}

const props = defineProps<Props>()
const route = useRoute()

const isActive = computed(() => {
  const targetPath = props.to.split('?')[0]!.split('#')[0]!
  if (targetPath === '/') return route.path === '/'
  return route.path === targetPath || route.path.startsWith(`${targetPath}/`)
})
</script>

<template>
  <NuxtLink
    :to="props.to"
    class="nav-link"
    :class="{ 'is-active': isActive }"
  >
    {{ props.label }}
    <span v-if="badge && badge > 0" class="nav-badge">{{ badge > 99 ? '99+' : badge }}</span>
  </NuxtLink>
</template>

<style scoped>
.nav-link {
  position: relative;
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  color: var(--dt-text-muted);
  text-decoration: none;
  white-space: nowrap;
  padding-bottom: 3px;
  transition: color 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, var(--dt-border-default), var(--dt-border-highlight));
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
  color: var(--dt-text-title);
}

.nav-link:hover::after,
.nav-link.is-active::after {
  transform: scaleX(1);
}

.nav-link.is-active {
  color: var(--dt-text-title);
}

.nav-badge {
  position: absolute;
  top: -6px;
  right: -12px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--dt-state-danger);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
