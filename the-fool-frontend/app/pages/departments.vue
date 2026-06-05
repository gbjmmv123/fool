<script setup lang="ts">
import { PAGE_META, DEPARTMENT_COPY } from '~/data/copy'
definePageMeta({ title: PAGE_META.departments, showTopNav: true, wideLayout: true })

const view = useDepartmentView()
const { userId } = useUserIdentity()

onMounted(() => {
  view.loadAll(true)
})
</script>

<template>
  <MainContent :wide="true" :title="PAGE_META.departments" :description="PAGE_META.departmentsDesc">
    <div v-if="view.allLoading.value" class="dept-loading">
      <span>DEPARTMENT_COPY.loading</span>
    </div>
    <div v-else-if="view.allError.value" class="dept-error">
      {{ view.allError.value }}
    </div>
    <DepartmentAccordion
      v-else-if="view.allDepartments.value"
      :items="view.allDepartments.value"
      :current-user-id="userId"
    />
  </MainContent>
</template>

<style scoped>
.dept-loading,
.dept-error {
  padding: 2rem 0;
  text-align: center;
  color: var(--dt-text-muted);
  font-size: 0.9rem;
}
</style>
