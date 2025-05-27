<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Grid } from '$lib/grid';
  import { 
    ThumbnailFactory, 
    registerThumbnailTypes,
    ThumbnailDistribution,
    BIO_CLUSTER_LAYOUT,
    type Thumbnail
  } from '$lib/thumbnails';
  import { 
    sampleBioData, 
    sampleSkillsData, 
    sampleExperienceData, 
    samplePhotoBoothData, 
    sampleJourneyData,
    sampleBlogArticles
  } from '$lib/data/sampleData';
  import { sampleCaseStudies, sampleTestimonials } from '$lib/data/contentData';
  
  let gridContainer: HTMLElement;
  let grid: Grid | null = null;
  let allThumbnails: Thumbnail[] = [];
  let visibleThumbnails: Thumbnail[] = [];
  let position = { x: 0, y: 0 };
  
  registerThumbnailTypes();
  
  // Create bio cluster thumbnails
  const bioThumbnails = [
    ThumbnailFactory.createThumbnail({
      id: 'bio-card',
      type: 'bio',
      gridX: 0.5,
      gridY: 0.5,
      content: sampleBioData
    }),
    ThumbnailFactory.createThumbnail({
      id: 'skills',
      type: 'skills',
      gridX: -2.5,
      gridY: -1.5,
      content: sampleSkillsData
    }),
    ThumbnailFactory.createThumbnail({
      id: 'experience',
      type: 'experience',
      gridX: 3.5,
      gridY: -0.5,
      content: sampleExperienceData
    }),
    ThumbnailFactory.createThumbnail({
      id: 'photoBooth',
      type: 'photoBooth',
      gridX: 3.5,
      gridY: 3.5,
      content: samplePhotoBoothData
    }),
    ThumbnailFactory.createThumbnail({
      id: 'journey',
      type: 'journey',
      gridX: -2.5,
      gridY: 1.5,
      content: sampleJourneyData
    })
  ];  
  // Create content thumbnails
  const contentThumbnails: Thumbnail[] = [];
  
  // Add blog article thumbnails
  sampleBlogArticles.forEach((article, index) => {
    contentThumbnails.push(
      ThumbnailFactory.createThumbnail({
        id: `blog-${index}`,
        type: 'blogArticle',
        gridX: 0, // Will be repositioned by distribution algorithm
        gridY: 0,
        content: article
      })
    );
  });
  
  // Add case study thumbnails
  sampleCaseStudies.forEach((caseStudy, index) => {
    contentThumbnails.push(
      ThumbnailFactory.createThumbnail({
        id: `case-study-${index}`,
        type: 'caseStudy',
        gridX: 0, // Will be repositioned by distribution algorithm
        gridY: 0,
        content: caseStudy
      })
    );
  });
  
  // Add testimonial thumbnails
  sampleTestimonials.forEach((testimonial, index) => {
    contentThumbnails.push(
      ThumbnailFactory.createThumbnail({
        id: `testimonial-${index}`,
        type: 'testimonial',
        gridX: 0, // Will be repositioned by distribution algorithm
        gridY: 0,
        content: testimonial
      })
    );
  });
  
  // Use distribution algorithm to position content thumbnails around bio cluster
  const distribution = new ThumbnailDistribution(BIO_CLUSTER_LAYOUT, contentThumbnails);
  const distributedContent = distribution.distributeContent();
  
  // Combine bio cluster and distributed content
  allThumbnails = [...bioThumbnails, ...distributedContent];
  
  $: {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--offset-x', `${position.x}px`);
      document.documentElement.style.setProperty('--offset-y', `${position.y}px`);
    }
  }  
  onMount(() => {
    if (gridContainer) {
      grid = new Grid({
        element: gridContainer,
        items: allThumbnails,
        initialPosition: { x: 0, y: 0 },
        enableKeyboardNavigation: true,
        onItemVisibilityChange: (items) => {
          visibleThumbnails = items.filter(item => 
            allThumbnails.find(t => t.id === item.id)
          ) as Thumbnail[];
        },
        onPositionChange: (pos) => {
          position = pos;
        }
      });
      
      setTimeout(() => {
        if (grid) {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          grid.setPosition(-viewportWidth / 2, -viewportHeight / 2, false);
        }
      }, 100);
    }
  });
  
  onDestroy(() => {
    if (grid) {
      grid.destroy();
    }
  });
  
  function navigateToThumbnail(id: string) {
    if (grid) {
      grid.navigateToItem(id, true);
    }
  }
  
  function renderThumbnail(thumbnail: Thumbnail) {
    return thumbnail.render();
  }
</script>

<div class="grid-container" bind:this={gridContainer}>
  {#each visibleThumbnails as thumbnail (thumbnail.id)}
    <button 
      type="button"
      class="thumbnail thumbnail-{thumbnail.type}"
      data-thumbnail-id={thumbnail.id}
      style="
        --grid-x: {thumbnail.gridX};
        --grid-y: {thumbnail.gridY};
        --span-x: {thumbnail.spanX};
        --span-y: {thumbnail.spanY};
      "
      on:click={() => navigateToThumbnail(thumbnail.id)}
      on:keydown={(e) => e.key === 'Enter' && navigateToThumbnail(thumbnail.id)}
      aria-label="View {thumbnail.id} content"
    >
      {@html renderThumbnail(thumbnail)}
    </button>
  {/each}
</div>
<div class="info-panel">
  <div class="info-content">
    <h2>Infinite Bento Grid Portfolio</h2>
    <p>Explore the interactive portfolio grid. Use mouse or touch to navigate.</p>
    <div class="thumbnail-count">
      Showing {visibleThumbnails.length} of {allThumbnails.length} thumbnails
    </div>
    <div class="quick-nav">
      <button on:click={() => navigateToThumbnail('bio-card')}>Bio</button>
      <button on:click={() => navigateToThumbnail('skills')}>Skills</button>
      <button on:click={() => navigateToThumbnail('experience')}>Experience</button>
      <button on:click={() => navigateToThumbnail('photoBooth')}>Photos</button>
      <button on:click={() => navigateToThumbnail('journey')}>Journey</button>
    </div>
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
  
  .thumbnail {
    position: absolute;
    transform: translate(
      calc((var(--grid-x) * (var(--cell-size) + var(--gap))) - var(--offset-x, 0px)),
      calc((var(--grid-y) * (var(--cell-size) + var(--gap))) - var(--offset-y, 0px))
    );
    width: calc(var(--span-x) * var(--cell-size) + (var(--span-x) - 1) * var(--gap));
    height: calc(var(--span-y) * var(--cell-size) + (var(--span-y) - 1) * var(--gap));
    background: var(--thumbnail-bg, #1a1a1a);
    border-radius: 12px;
    border: 1px solid var(--thumbnail-border, #333);
    padding: 16px;
    color: var(--thumbnail-text, #fff);
    cursor: pointer;
    transition: all var(--animation-duration, 0.3s) var(--animation-easing, ease);
    overflow: hidden;
    user-select: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .thumbnail:hover {
    transform: translate(
      calc((var(--grid-x) * (var(--cell-size) + var(--gap))) - var(--offset-x, 0px)),
      calc((var(--grid-y) * (var(--cell-size) + var(--gap))) - var(--offset-y, 0px))
    ) scale(1.02);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    border-color: var(--thumbnail-border-hover, #555);
  }
  
  .thumbnail:focus {
    outline: 2px solid var(--focus-color, #4A90E2);
    outline-offset: 2px;
  }
  .info-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(26, 26, 26, 0.95);
    border: 1px solid #333;
    border-radius: 12px;
    padding: 20px;
    color: white;
    backdrop-filter: blur(10px);
    z-index: 100;
    max-width: 280px;
  }
  
  .info-panel h2 {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    color: #4A90E2;
  }
  
  .info-panel p {
    margin: 0 0 12px 0;
    font-size: 0.85rem;
    opacity: 0.8;
  }
  
  .thumbnail-count {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-bottom: 12px;
  }
  
  .quick-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .quick-nav button {
    background: #333;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .quick-nav button:hover {
    background: #4A90E2;
  }

  /* Bio card styles */
  :global(.bio-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :global(.bio-card__header) {
    position: relative;
    margin-bottom: 16px;
  }

  :global(.bio-card__profile) {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--thumbnail-border, #333);
  }
  :global(.bio-card__status) {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--thumbnail-bg, #1a1a1a);
  }

  :global(.bio-card__status.available) { background: #4CAF50; }
  :global(.bio-card__status.busy) { background: #FF9800; }
  :global(.bio-card__status.away) { background: #757575; }

  :global(.bio-card__name) {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0 0 4px 0;
  }

  :global(.bio-card__title) {
    font-size: 0.9rem;
    color: var(--text-secondary, #ccc);
    margin: 0 0 8px 0;
  }

  :global(.bio-card__description) {
    font-size: 0.8rem;
    line-height: 1.4;
    margin: 0 0 16px 0;
    flex: 1;
  }

  :global(.bio-card__meta) {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.7rem;
    color: var(--text-tertiary, #999);
  }

  /* Skills thumbnail styles */
  :global(.skills-thumbnail__title) {
    font-size: 1rem;
    margin: 0 0 12px 0;
    color: #4A90E2;
  }

  :global(.skill-category__name) {
    font-size: 0.8rem;
    margin: 0 0 6px 0;
    color: #ccc;
  }

  :global(.skill) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  :global(.skill__name) {
    font-size: 0.75rem;
  }

  :global(.skill__level) {
    display: flex;
    gap: 2px;
  }

  :global(.skill__dot) {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #333;
  }

  :global(.skill__dot.active) {
    background: #4A90E2;
  }
</style>