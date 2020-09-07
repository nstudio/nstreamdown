/**
 * MdImage Component
 * Renders images with loading state and error handling
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, signal, input, effect, ViewChild, ElementRef } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { ImageSource, Image } from '@nativescript/core';

@Component({
  selector: 'MdImage',
  template: `
    <StackLayout class="my-3">
      <GridLayout height="160" class="rounded-lg">
        <!-- Loading state -->
        @if (loading()) {
          <ActivityIndicator busy="true" class="w-8 h-8"></ActivityIndicator>
        }

        <!-- Error state -->
        @if (error()) {
          <StackLayout class="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 align-middle" horizontalAlignment="center">
            <Label text="⚠️ Failed to load image" class="text-sm text-gray-500 dark:text-gray-400 text-center"></Label>
            <Label [text]="alt() || src()" class="text-xs text-gray-400 dark:text-gray-500 text-center mt-1" textWrap="true"></Label>
          </StackLayout>
        }

        <!-- Image (hidden until loaded) -->
        @if (imageSource()) {
          <GridLayout class="align-top rounded-lg" rows="auto" columns="auto" horizontalAlignment="center">
            <Image #imageRef [src]="imageSource()" [stretch]="stretch()" class="rounded-lg h-[150]"></Image>
          </GridLayout>
        }
      </GridLayout>

      <!-- Caption -->
      @if (alt() && !error()) {
        <Label [text]="alt()" class="text-xs text-gray-500 dark:text-gray-400 text-center mb-1 align-bottom"></Label>
      }
    </StackLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdImage {
  src = input('');
  alt = input('');
  stretch = input<'aspectFit' | 'aspectFill' | 'fill' | 'none'>('aspectFit');

  loading = signal(true);
  error = signal(false);
  imageSource = signal<ImageSource | null>(null);

  constructor() {
    // React to src changes and load the image
    effect(() => {
      const url = this.src();
      if (url) {
        this.loadImage(url);
      }
    });
  }

  private async loadImage(url: string) {
    this.loading.set(true);
    this.error.set(false);
    this.imageSource.set(null);

    try {
      const source = await ImageSource.fromUrl(url);
      if (source) {
        this.imageSource.set(source);
        this.loading.set(false);
      } else {
        throw new Error('ImageSource returned null');
      }
    } catch (err) {
      console.error('Image failed to load:', url, err);
      this.loading.set(false);
      this.error.set(true);
    }
  }
}
