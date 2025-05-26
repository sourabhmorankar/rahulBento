<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { Grid } from '$lib/grid';
  import type { GridItem } from '$lib/grid/VirtualGrid';
  
  let gridContainer: HTMLElement;
  let grid: Grid | null = null;
  let visibleItems: GridItem[] = [];
  let position = { x: 0, y: 0 };
  let offsetX = 0;
  let offsetY = 0;
  
  // Sample grid items for demonstration
  const gridItems: GridItem[] = [
    { id: 'center', gridX: 0, gridY: 0, spanX: 2, spanY: 2 },
    { id: 'item1', gridX: 3, gridY: 0, spanX: 1, spanY: 1 },
    { id: 'item2', gridX: 3, gridY: 2, spanX: 1, spanY: 1 },
    { id: 'item3', gridX: 0, gridY: 3, spanX: 1, spanY: 1 },
    { id: 'item4', gridX: -3, gridY: 0, spanX: 1, spanY: 1 },
    { id: 'item5', gridX: -3, gridY: -2, spanX: 1, spanY: 1 },
    { id: 'item6', gridX: 0, gridY: -3, spanX: 1, spanY: 1 },
    // Add more items in a spiral pattern
    { id: 'item7', gridX: 5, gridY: -2, spanX: 1, spanY: 1 },
    { id: 'item8', gridX: -5, gridY: 2, spanX: 1, spanY: 1 },
    { id: 'item9', gridX: 2, gridY: 5, spanX: 1, spanY: 1 },
    { id: 'item10', gridX: -2, gridY: -5, spanX: 1, spanY: 1 },
  ];
  
  // Update CSS variables when position changes
  $: {
    if (typeof document !== 'undefined') {
      offsetX = position.x;
      offsetY = position.y;
      document.documentElement.style.setProperty('--offset-x', `${offsetX}px`);
      document.documentElement.style.setProperty('--offset-y', `${offsetY}px`);
    }
  }
  
  onMount(() => {
    if (gridContainer) {
      // Set initial CSS variables
      document.documentElement.style.setProperty('--offset-x', '0px');
      document.documentElement.style.setProperty('--offset-y', '0px');
      
      grid = new Grid({
        element: gridContainer,
        items: gridItems,
        initialPosition: { x: 0, y: 0 },
        enableKeyboardNavigation: true,
        onItemVisibilityChange: (items) => {
          visibleItems = items;
        },
        onPositionChange: (pos) => {
          position = pos;
        },
        onItemFocus: (itemId) => {
          console.log('Item focused:', itemId);
        },
      });
      
      // Center the grid initially
      setTimeout(() => {
        if (grid) {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          grid.setPosition(
            -viewportWidth / 2,
            -viewportHeight / 2,
            false
          );
        }
      }, 100);
    }
  });
  
  onDestroy(() => {
    if (grid) {
      grid.destroy();
    }
  });
  
  function navigateToItem(id: string) {
    if (grid) {
      grid.navigateToItem(id, true);
    }
  }
</script>

<div class="grid-container" bind:this={gridContainer}>
  {#each visibleItems as item (item.id)}
    <button 
      type="button"
      class="grid-item"
      data-item-id={item.id}
      style="
        --grid-x: {item.gridX};
        --grid-y: {item.gridY};
        --span-x: {item.spanX};
        --span-y: {item.spanY};
      "
      on:click={() => navigateToItem(item.id)}
      on:keydown={(e) => e.key === 'Enter' && navigateToItem(item.id)}
      aria-label="Navigate to item {item.id}"
    >
      <div class="item-content">
        <h3>{item.id}</h3>
        <p>Position: ({item.gridX}, {item.gridY})</p>
        <p>Size: {item.spanX}x{item.spanY}</p>
      </div>
    </button>
  {/each}
</div>

<div class="controls">
  <div class="position-info">
    <p>Scroll Position: ({Math.round(position.x)}, {Math.round(position.y)})</p>
  </div>
  <div class="navigation">
    <button on:click={() => navigateToItem('center')}>Center</button>
    {#each gridItems.filter(item => item.id !== 'center') as item}
      <button on:click={() => navigateToItem(item.id)}>{item.id}</button>
    {/each}
  </div>
</div>

<style>
  .grid-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  .grid-item {
    position: absolute;
    transform: translate(
      calc((var(--grid-x) * (var(--cell-size) + var(--gap))) - var(--offset-x, 0px)),
      calc((var(--grid-y) * (var(--cell-size) + var(--gap))) - var(--offset-y, 0px))
    );
    width: calc(var(--span-x) * var(--cell-size) + (var(--span-x) - 1) * var(--gap));
    height: calc(var(--span-y) * var(--cell-size) + (var(--span-y) - 1) * var(--gap));
    cursor: pointer;
  }
  
  .grid-item:hover {
    transform: translate(
      calc((var(--grid-x) * (var(--cell-size) + var(--gap))) - var(--offset-x, 0px)),
      calc((var(--grid-y) * (var(--cell-size) + var(--gap))) - var(--offset-y, 0px))
    ) scale(1.02);
  }
  
  .item-content {
    padding: 16px;
    color: white;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  
  .item-content h3 {
    margin: 0 0 8px 0;
    font-size: 1.2rem;
  }
  
  .item-content p {
    margin: 4px 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  .controls {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .position-info {
    margin-bottom: 10px;
  }
  
  .position-info p {
    margin: 0;
    font-size: 0.9rem;
  }
  
  .navigation {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  button {
    background-color: #4a4a4a;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }
  
  button:hover {
    background-color: #5a5a5a;
  }
</style>
