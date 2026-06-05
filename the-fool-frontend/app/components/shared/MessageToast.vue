<script setup lang="ts">
const { toasts, removeToast } = useMessage()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="item in toasts"
          :key="item.id"
          class="toast-item"
          :style="item.color ? { '--toast-color': item.color } : undefined"
          @click="removeToast(item.id)"
        >
          <span class="toast-text">
            <template v-for="(line, idx) in item.text.split('\n')" :key="idx">
              {{ line }}<br v-if="idx < item.text.split('\n').length - 1">
            </template>
          </span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 60px;
  left: 50%;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  transform: translateX(-50%);
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--dt-bg-elevated);
  border: 1px solid var(--toast-color, var(--dt-border-default));
  border-radius: 10px;
  color: var(--toast-color, var(--dt-text-body));
  font-size: 0.95rem;
  white-space: nowrap;
  pointer-events: auto;
  cursor: pointer;
  backdrop-filter: blur(12px);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 16px color-mix(in srgb, var(--toast-color, var(--dt-border-default)) 50%, transparent),
    0 0 32px color-mix(in srgb, var(--toast-color, var(--dt-border-default)) 25%, transparent);
  transition: all 0.25s ease;
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
