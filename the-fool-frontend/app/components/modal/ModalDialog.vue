<script setup lang="ts">
import { MODAL } from '~/data/copy'
const props = defineProps({
  title: String,
  blocking: {
    type: Boolean,
    default: false,
  },
  closeOnEsc: {
    type: Boolean,
    default: undefined,
  },
  maskClosable: {
    type: Boolean,
    default: undefined,
  },
  showClose: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{ close: [] }>()

const closeOnEscEffective = computed(() => props.closeOnEsc == null ? !props.blocking : props.closeOnEsc)
const maskClosableEffective = computed(() => props.maskClosable == null ? !props.blocking : props.maskClosable)

const _modalCount = useState<number>('church-modal-stack-count', () => 0)
const cardRef = ref<HTMLElement>()

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && closeOnEscEffective.value) {
    emit('close')
  }
}

onMounted(() => {
  _modalCount.value++
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKeyDown)
  nextTick(() => {
    const el = cardRef.value?.querySelector<HTMLElement>('input, button, [tabindex]')
    el?.focus()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  _modalCount.value = Math.max(0, _modalCount.value - 1)
  if (_modalCount.value === 0) document.body.style.overflow = ''
})

function onMaskClick() {
  if (maskClosableEffective.value) {
    emit('close')
  }
}
</script>

<template>
  <div
    class="modal-dialog__mask"
    :data-blocking="blocking || undefined"
    role="dialog"
    aria-modal="true"
    @click="onMaskClick"
  >
    <div ref="cardRef" class="modal-dialog__card" @click.stop>
      <header v-if="title || showClose" class="modal-dialog__header">
        <span v-if="title">{{ title }}</span>
        <button v-if="showClose" class="modal-dialog__close" :aria-label="MODAL.modalCloseAriaLabel" @click="emit('close')">✕</button>
      </header>
      <div class="modal-dialog__body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="modal-dialog__footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>
