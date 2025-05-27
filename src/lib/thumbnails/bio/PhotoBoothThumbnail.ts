import { Thumbnail, type ThumbnailConfig, type ThumbnailContent } from '../Thumbnail';

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  alt: string;
  date?: string;
}

export interface PhotoBoothContent extends ThumbnailContent {
  photos: Photo[];
  title: string;
}

export class PhotoBoothThumbnail extends Thumbnail {
  declare content: PhotoBoothContent;
  private currentPhotoIndex = 0;

  constructor(config: ThumbnailConfig) {
    super({
      ...config,
      type: 'photoBooth',
      spanX: 2,
      spanY: 2,
    });
  }

  render(): string {
    const { photos, title } = this.content;
    const currentPhoto = photos[this.currentPhotoIndex] || photos[0];
    
    return `
      <div class="photo-booth-thumbnail">
        <div class="photo-booth__header">
          <h3 class="photo-booth__title">${title}</h3>
          <div class="photo-booth__counter">${this.currentPhotoIndex + 1}/${photos.length}</div>
        </div>
        <div class="photo-booth__frame">
          <img class="photo-booth__photo" 
               src="${currentPhoto.url}" 
               alt="${currentPhoto.alt}"
               loading="lazy">
          ${currentPhoto.caption ? `<p class="photo-booth__caption">${currentPhoto.caption}</p>` : ''}
        </div>
        <div class="photo-booth__controls">
          <button class="photo-booth__nav prev" onclick="this.closest('.thumbnail').dispatchEvent(new CustomEvent('prev-photo'))">‹</button>
          <button class="photo-booth__nav next" onclick="this.closest('.thumbnail').dispatchEvent(new CustomEvent('next-photo'))">›</button>
        </div>
      </div>
    `;
  }

  nextPhoto(): void {
    if (this.content.photos.length > 1) {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.content.photos.length;
      if (this.element) {
        this.element.innerHTML = this.render();
      }
    }
  }

  previousPhoto(): void {
    if (this.content.photos.length > 1) {
      this.currentPhotoIndex = this.currentPhotoIndex === 0 
        ? this.content.photos.length - 1 
        : this.currentPhotoIndex - 1;
      if (this.element) {
        this.element.innerHTML = this.render();
      }
    }
  }

  bindElement(element: HTMLElement): void {
    super.bindElement(element);
    
    element.addEventListener('next-photo', () => this.nextPhoto());
    element.addEventListener('prev-photo', () => this.previousPhoto());
  }
}