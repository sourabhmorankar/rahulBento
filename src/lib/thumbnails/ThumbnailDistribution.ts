import type { Thumbnail } from './Thumbnail';

export interface BioClusterConfig {
  margin: number;
  thumbnails: Record<string, {
    x: number;
    y: number;
    spanX: number;
    spanY: number;
  }>;
}

export class ThumbnailDistribution {
  private occupiedCells = new Set<string>();
  private spiralPattern: Array<{ x: number; y: number }> = [];

  constructor(
    private bioCluster: BioClusterConfig,
    private contentThumbnails: Thumbnail[]
  ) {
    this.spiralPattern = this.generateSpiralPattern();
  }

  distributeContent(): Thumbnail[] {
    this.occupiedCells.clear();
    
    this.markBioClusterCells();
    this.addBioClusterMargin();
    
    return this.distributeContentThumbnails();
  }

  private markBioClusterCells(): void {
    for (const [id, config] of Object.entries(this.bioCluster.thumbnails)) {
      this.markCellsOccupied(config.x, config.y, config.spanX, config.spanY);
    }
  }
  private addBioClusterMargin(): void {
    // Mark cells occupied by bio cluster thumbnails without additional margin
    const bioPositions = Object.values(this.bioCluster.thumbnails);
    
    // We're not adding an extra margin around the bio cluster anymore
    // We'll just mark the cells occupied by the bio thumbnails themselves
    for (const position of bioPositions) {
      for (let x = position.x; x < position.x + position.spanX; x++) {
        for (let y = position.y; y < position.y + position.spanY; y++) {
          this.occupiedCells.add(`${x},${y}`);
        }
      }
    }
  }

  private distributeContentThumbnails(): Thumbnail[] {
    const distributedThumbnails: Thumbnail[] = [];
    let spiralIndex = 0;

    for (const thumbnail of this.contentThumbnails) {
      const position = this.findNextAvailablePosition(thumbnail, spiralIndex);
      if (position) {
        thumbnail.setPosition(position.x, position.y);
        this.markCellsOccupied(position.x, position.y, thumbnail.spanX, thumbnail.spanY);
        distributedThumbnails.push(thumbnail);
        spiralIndex = position.spiralIndex + 1;
      }
    }

    return distributedThumbnails;
  }
  private generateSpiralPattern(): Array<{ x: number; y: number }> {
    const spiral = [];
    const maxRadius = 30;
    
    // Start with a smaller initial radius to place thumbnails closer to the bio cluster
    // This will make the bio cluster feel more surrounded by other thumbnails
    for (let radius = 3; radius <= maxRadius; radius++) {
      for (let x = -radius; x <= radius; x++) {
        spiral.push({ x, y: -radius });
      }
      for (let y = -radius + 1; y <= radius; y++) {
        spiral.push({ x: radius, y });
      }
      for (let x = radius - 1; x >= -radius; x--) {
        spiral.push({ x, y: radius });
      }
      for (let y = radius - 1; y > -radius; y--) {
        spiral.push({ x: -radius, y });
      }
    }
    
    return spiral;
  }

  private findNextAvailablePosition(
    thumbnail: Thumbnail, 
    startIndex: number
  ): { x: number; y: number; spiralIndex: number } | null {
    for (let i = startIndex; i < this.spiralPattern.length; i++) {
      const candidate = this.spiralPattern[i];
      
      if (this.canPlaceThumbnail(candidate.x, candidate.y, thumbnail.spanX, thumbnail.spanY)) {
        return { ...candidate, spiralIndex: i };
      }
    }
    return null;
  }
  private canPlaceThumbnail(x: number, y: number, spanX: number, spanY: number): boolean {
    for (let dx = 0; dx < spanX; dx++) {
      for (let dy = 0; dy < spanY; dy++) {
        if (this.occupiedCells.has(`${x + dx},${y + dy}`)) {
          return false;
        }
      }
    }
    return true;
  }

  private markCellsOccupied(x: number, y: number, spanX: number, spanY: number): void {
    for (let dx = 0; dx < spanX; dx++) {
      for (let dy = 0; dy < spanY; dy++) {
        this.occupiedCells.add(`${x + dx},${y + dy}`);
      }
    }
  }
}