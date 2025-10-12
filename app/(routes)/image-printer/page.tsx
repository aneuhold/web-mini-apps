'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

type ImageData = {
  id: string;
  file: File;
  url: string;
  caption: string;
};

/**
 * Image Printer page component.
 * Allows users to upload images, add captions, and print them in a formatted layout.
 */
export default function Page() {
  const [images, setImages] = useState<ImageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
    };
    // It's like this on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles file selection from the file input.
   * @param event - The change event from the file input
   */
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageData[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      caption: ''
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Updates the caption for a specific image.
   * @param id - The unique identifier for the image
   * @param caption - The new caption text
   */
  const handleCaptionChange = (id: string, caption: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  /**
   * Removes an image from the list.
   * @param id - The unique identifier for the image to remove
   */
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  /**
   * Opens the browser's print dialog.
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Opens the file picker dialog.
   */
  const handleAddImages = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Image Printer</h1>
        <p>Upload images, add captions, and print them in a formatted layout (4 per page).</p>
      </div>

      <div className={styles.controls}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className={styles.fileInput}
          aria-label="Select images to upload"
        />
        <button onClick={handleAddImages} className={styles.button} type="button">
          Add Images
        </button>
        {images.length > 0 && (
          <button
            onClick={handlePrint}
            className={`btn-secondary ${styles.printButton}`}
            type="button"
          >
            Print ({images.length} {images.length === 1 ? 'image' : 'images'})
          </button>
        )}
      </div>

      {images.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No images added yet. Click "Add Images" to get started.</p>
        </div>
      ) : (
        <div className={styles.pagesContainer}>
          {chunkArray(images, 4).map((pageImages, pageIndex) => (
            <div key={pageIndex} className={styles.page}>
              {pageImages.map((image) => (
                <div key={image.id} className={styles.imageCard}>
                  <div className={styles.imageWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.caption || 'Uploaded image'}
                      className={styles.image}
                    />
                    <button
                      onClick={() => {
                        handleRemoveImage(image.id);
                      }}
                      className={styles.removeButton}
                      type="button"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => {
                      handleCaptionChange(image.id, e.target.value);
                    }}
                    placeholder="Add a caption..."
                    className={styles.captionInput}
                    aria-label="Image caption"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to chunk an array into groups of a specified size.
 * @param array - The array to chunk
 * @param size - The size of each chunk
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
