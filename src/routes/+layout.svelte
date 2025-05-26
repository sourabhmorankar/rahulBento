<script lang="ts">
  import "../styles/global.css";
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
</script>

<div class="app-container">
  <slot />
</div>

<style>
  .app-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--background-color);
    touch-action: none;
    user-select: none;
  }
</style>
