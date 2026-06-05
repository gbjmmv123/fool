<!-- ================================================================
  [TEST PAGE - 临时测试页，完成后删除]
  路由: /dev/cards
  用途: 预览所有长官的 ResultDetailCard 样式效果
  删除方式:
    1. 删除此文件 (app/pages/dev/cards.vue)
    2. 删除 app/pages/index.vue 中 "TEST ONLY" 注释块内的代码
  ================================================================ -->
<script setup lang="ts">
import { DEPARTMENT_DATA } from '~/data/departments'
import type { DepartmentId } from '~/types/department'

definePageMeta({
  title: '[测试] 结果卡片预览',
  showTopNav: true,
})

// 所有部门 ID 列表，顺序与 departments.ts 保持一致
const departmentIds = Object.keys(DEPARTMENT_DATA) as DepartmentId[]

const currentIndex = ref(0)
const currentId = computed(() => departmentIds[currentIndex.value])
const currentDept = computed(() => DEPARTMENT_DATA[currentId.value])

function selectIndex(i: number) {
  currentIndex.value = i
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + departmentIds.length) % departmentIds.length
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % departmentIds.length
}
</script>

<template>
  <MainContent title="[测试] 结果卡片预览">
    <div class="dev-cards">

      <!-- 部门选择按钮组 -->
      <div class="dev-cards__tabs">
        <button
          v-for="(id, i) in departmentIds"
          :key="id"
          class="dev-cards__tab"
          :class="{ 'is-active': i === currentIndex }"
          :style="{ '--tab-color': DEPARTMENT_DATA[id].themeColor }"
          @click="selectIndex(i)"
        >
          {{ DEPARTMENT_DATA[id].name }}
        </button>
      </div>

      <!-- 当前长官名称提示 -->
      <p class="dev-cards__label">
        {{ currentDept.officer.name }} · {{ currentDept.name }}部门
      </p>

      <!-- 结果卡片 -->
      <div class="dev-cards__card-wrap">
        <!-- key 变化时触发 ResultDetailCard 内部的 onMounted 动画 -->
        <ResultDetailCard
          :key="currentId"
          :department-id="currentId"
          joined-at="2024-01-01T00:00:00Z"
          :show-retake="true"
        />
      </div>

      <!-- 上一个 / 下一个 -->
      <div class="dev-cards__nav">
        <button class="dev-cards__nav-btn" @click="prev">← 上一个</button>
        <span class="dev-cards__counter">{{ currentIndex + 1 }} / {{ departmentIds.length }}</span>
        <button class="dev-cards__nav-btn" @click="next">下一个 →</button>
      </div>

    </div>
  </MainContent>
</template>

<style scoped>
.dev-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0 3rem;
}

/* 部门选择按钮组 */
.dev-cards__tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  max-width: 480px;
}

.dev-cards__tab {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--tab-color) 40%, transparent);
  background: color-mix(in srgb, var(--tab-color) 8%, transparent);
  color: color-mix(in srgb, var(--tab-color) 80%, var(--dt-text-muted));
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  letter-spacing: 0.04em;
}

.dev-cards__tab:hover {
  background: color-mix(in srgb, var(--tab-color) 18%, transparent);
}

.dev-cards__tab.is-active {
  background: color-mix(in srgb, var(--tab-color) 22%, transparent);
  border-color: var(--tab-color);
  color: var(--tab-color);
}

/* 当前长官标签 */
.dev-cards__label {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  margin: 0;
  letter-spacing: 0.04em;
}

/* 卡片容器 */
.dev-cards__card-wrap {
  width: 100%;
  max-width: 420px;
}

/* 上一个/下一个导航 */
.dev-cards__nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.dev-cards__nav-btn {
  font-size: 0.8rem;
  color: var(--dt-text-muted);
  background: none;
  border: 1px solid var(--dt-border-subtle);
  border-radius: 6px;
  padding: 0.35rem 0.9rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  letter-spacing: 0.02em;
}

.dev-cards__nav-btn:hover {
  color: var(--dt-text-body);
  border-color: var(--dt-border-default);
}

.dev-cards__counter {
  font-size: 0.75rem;
  color: var(--dt-text-muted);
  min-width: 3rem;
  text-align: center;
}
</style>
