<script setup lang="ts">
import type { DialogType } from '~/types/dialog'
import NameInputModal from '~/components/modal/NameInputModal.vue'
import WelcomeModal from '~/components/modal/WelcomeModal.vue'
import AlertModal from '~/components/modal/AlertModal.vue'
import ConfirmModal from '~/components/modal/ConfirmModal.vue'
import ShareCardModal from '~/components/modal/ShareCardModal.vue'
import AvatarCropModal from '~/components/modal/AvatarCropModal.vue'
import BadgeWechatSaveModal from '~/components/modal/BadgeWechatSaveModal.vue'
import StaffPasswordModal from '~/components/modal/StaffPasswordModal.vue'
import ErrorModal from '~/components/modal/ErrorModal.vue'

const { dialogs } = useDialog()

const componentMap: Record<DialogType, unknown> = {
  name: NameInputModal,
  welcome: WelcomeModal,
  alert: AlertModal,
  confirm: ConfirmModal,
  share: ShareCardModal,
  'avatar-crop': AvatarCropModal,
  'badge-wechat-save': BadgeWechatSaveModal,
  'staff-password': StaffPasswordModal,
  'error-modal': ErrorModal,
}

function resolveModalComponent(type: DialogType) {
  return componentMap[type]
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="modal" tag="div" class="modal-stack">
      <component
        :is="resolveModalComponent(dialog.type)"
        v-for="dialog in dialogs"
        :key="dialog.key"
        :dialog-key="dialog.key"
        :payload="dialog.payload"
        :blocking="dialog.blocking"
      />
    </TransitionGroup>
  </Teleport>
</template>
