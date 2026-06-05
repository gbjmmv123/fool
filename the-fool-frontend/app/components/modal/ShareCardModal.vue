<script setup lang="ts">
import type { ExamResultResponse } from '~/types/result'
import { getDepartmentData, DEPARTMENT_DATA } from '~/data/departments'
import type { DepartmentId } from '~/types/department'
import { RESULT, t } from '~/data/copy'

const props = defineProps<{
  dialogKey: string
  payload: Record<string, unknown>
  blocking: boolean
}>()

const { closeDialog } = useDialog()

const data = computed(() => props.payload.data as ExamResultResponse)

// ===== TEMP: 测试用——手动切换分享卡片的长官 =====
const selectedDeptId = ref<string>(data.value.assignedDepartmentId)
const deptOptions = Object.keys(DEPARTMENT_DATA) as string[]
function onDeptSwitch(e: Event) {
  selectedDeptId.value = (e.target as HTMLSelectElement).value
}
// ===== TEMP END =====

const dept = computed(() => getDepartmentData(selectedDeptId.value))
const deptTitle = computed(() => {
  if (!dept.value) return ''
  return dept.value.name + (dept.value.officer.gender === 'female' ? '女士' : '先生')
})

const formattedTime = computed(() => {
  const d = new Date(data.value.detail.joinedAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

const cardRef = ref<HTMLElement | null>(null)
const saving = ref(false)
const showSavingToast = ref(false)

function close() {
  closeDialog(props.dialogKey)
}

async function saveCard() {
  if (!dept.value || saving.value || !cardRef.value) return
  saving.value = true
  showSavingToast.value = true

  try {
    const { toCanvas } = await import('html-to-image')
    const card = cardRef.value

    await nextTick()

    const imgs = Array.from(card.querySelectorAll('img'))
    await Promise.all(imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener('load', () => res(), { once: true })
            img.addEventListener('error', () => res(), { once: true })
          }),
    ))

    const rect = card.getBoundingClientRect()
    const dpr = Math.max(window.devicePixelRatio || 1, 2)

    const canvas = await toCanvas(card, {
      skipFonts: true,
      backgroundColor: '#000000',
      pixelRatio: dpr,
      canvasWidth: Math.round(rect.width * dpr),
      canvasHeight: Math.round(rect.height * dpr),
    })

    const link = document.createElement('a')
    link.download = t(RESULT.shareDownloadName, { dept: dept.value.name })
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    saving.value = false
    showSavingToast.value = false
  }
}
</script>

<template>
  <ModalDialog
    :title="RESULT.shareTitle"
    :blocking="false"
    :show-close="true"
    @close="close"
  >
    <!-- ===== TEMP END ===== -->

    <div v-if="dept" class="share-modal">
      <!-- Card area: wraps card + toast overlay -->
      <div class="share-modal__card-wrap">
        <div
          ref="cardRef"
          class="share-card"
          :style="{ '--card-theme': dept.themeColor }"
        >
          <img
            :src="dept.shareImage"
            :alt="dept.name"
            class="share-card__bg"
          >
          <div class="share-card__text">
            <p>您已于{{ formattedTime }}</p>
            <p>入职{{ deptTitle }}的部门</p>
            <p>扫码入职愚者教会</p>
          </div>
          <img src="/static/qr.png" alt="QR" class="share-card__qr" />
        </div>

        <!-- Saving toast overlaid on the card -->
        <Transition name="toast-fade">
          <div v-if="showSavingToast" class="share-modal__toast">
            <div class="share-modal__toast-inner">
              <p>{{ RESULT.shareGenerating }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <template #footer>
      <button class="btn" type="button" @click="close">
        关闭
      </button>
      <button
        class="btn btn--primary"
        type="button"
        :disabled="saving"
        @click="saveCard"
      >
        {{ saving ? RESULT.shareSavingBtn : RESULT.shareSaveBtn }}
      </button>
    </template>
  </ModalDialog>
</template>

<style scoped>
.share-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ===== TEMP: 测试用切换长官样式 ===== */
.share-modal__temp-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px dashed rgba(212, 184, 134, 0.3);
}

.share-modal__temp-label {
  font-size: 0.8rem;
  color: #d4b886;
  white-space: nowrap;
}

.share-modal__temp-select {
  flex: 1;
  padding: 0.3rem 0.5rem;
  background: rgba(24, 24, 28, 0.8);
  border: 1px solid rgba(212, 184, 134, 0.3);
  border-radius: 6px;
  color: #e0d7c6;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}

.share-modal__temp-select:focus {
  border-color: #d4b886;
}
/* ===== TEMP END ===== */

:deep(.modal-dialog__card) {
  max-width: 480px;
}

/* ===== Card wrapper ===== */
.share-modal__card-wrap {
  position: relative;
}

/* ===== Share card ===== */
.share-card {
  --card-theme: #000000;
  position: relative;
  width: min(100%, 420px);
  margin: 0 auto;
  aspect-ratio: 3 / 5;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--card-theme) 18%, #ffffff) 0%,
    #ffffff 100%
  );
  overflow: hidden;
}

.share-card__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* ===== Bottom-left text ===== */
/* Tweak left / bottom values here to adjust positioning */
.share-card__text {
  position: absolute;
  transform: translateX(-50%);
  left: 50%;
  bottom: 2%;
  max-width: 62%;
  color: #8c847c;
  font-size: 0.6rem;
  line-height: 1.6;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  pointer-events: none;
  text-align: center;
}

.share-card__text p {
  margin: 0;
}

.share-card__blank {
  height: 0.55em;
}

/* ===== Bottom-right QR placeholder ===== */
/* Tweak right / bottom / width / height to adjust */
.share-card__qr {
  position: absolute;
  right: 5%;
  bottom: 2.5%;
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: block;
}

/* ===== Saving toast ===== */
.share-modal__toast {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.share-modal__toast-inner {
  background: rgba(24, 24, 28, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  color: #ffffff;
  font-size: 0.9rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.share-modal__toast-inner p {
  margin: 0;
}

/* Toast fade transition */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.25s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}

/* ===== Buttons ===== */
.btn--primary {
  background: rgba(212, 184, 134, 0.15);
  border-color: var(--dt-primary);
  color: var(--dt-primary);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
