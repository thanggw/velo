<template>
  <main class="forbidden-page">
    <section class="panel forbidden-panel">
      <el-result icon="warning" title="403" sub-title="You do not have permission to access this page.">
        <template #extra>
          <el-button type="primary" @click="$router.push('/projects')">Back to projects</el-button>
        </template>
      </el-result>
    </section>
  </main>
</template>

<style scoped>
.forbidden-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background: var(--velo-bg);
}

.forbidden-panel {
  width: min(520px, 100%);
  padding: 14px;
}
</style>
