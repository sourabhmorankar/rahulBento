import { Thumbnail, type ThumbnailConfig } from './Thumbnail';

export type ThumbnailConstructor = new (config: ThumbnailConfig) => Thumbnail;

export class ThumbnailFactory {
  private static thumbnailTypes = new Map<string, ThumbnailConstructor>();

  static registerThumbnailType(type: string, constructor: ThumbnailConstructor): void {
    this.thumbnailTypes.set(type, constructor);
  }

  static createThumbnail(config: ThumbnailConfig): Thumbnail {
    const Constructor = this.thumbnailTypes.get(config.type);
    
    if (!Constructor) {
      throw new Error(`Unknown thumbnail type: ${config.type}`);
    }

    this.validateConfig(config);
    return new Constructor(config);
  }

  static createThumbnails(configs: ThumbnailConfig[]): Thumbnail[] {
    return configs.map(config => this.createThumbnail(config));
  }

  static getRegisteredTypes(): string[] {
    return Array.from(this.thumbnailTypes.keys());
  }

  static isTypeRegistered(type: string): boolean {
    return this.thumbnailTypes.has(type);
  }
  static validateConfig(config: ThumbnailConfig): void {
    if (!config.id) {
      throw new Error('Thumbnail config must have an id');
    }
    
    if (!config.type) {
      throw new Error('Thumbnail config must have a type');
    }
    
    if (typeof config.gridX !== 'number' || typeof config.gridY !== 'number') {
      throw new Error('Thumbnail config must have valid gridX and gridY coordinates');
    }
    
    if (config.spanX && (config.spanX < 1 || !Number.isInteger(config.spanX))) {
      throw new Error('Thumbnail spanX must be a positive integer');
    }
    
    if (config.spanY && (config.spanY < 1 || !Number.isInteger(config.spanY))) {
      throw new Error('Thumbnail spanY must be a positive integer');
    }
  }
}