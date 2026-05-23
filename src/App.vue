<script setup lang="ts"></script>

<template>
  <slot />
</template>

<style>
html,
body,
#app,
uni-app,
uni-page,
uni-page-wrapper,
uni-page-body {
  min-height: 100%;
  margin: 0;
  background: #f6fbf3;
  color: #2d3a2d;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  -webkit-text-size-adjust: 100%;
  touch-action: manipulation;
}

body {
  overflow-x: hidden;
}

page {
  max-width: 480px;
  min-height: 100vh;
  margin: 0 auto;
  background: #f6fbf3;
  box-sizing: border-box;
}

button,
image,
view,
text {
  touch-action: manipulation;
}
</style>
