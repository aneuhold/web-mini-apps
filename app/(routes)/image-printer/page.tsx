'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  clearData,
  fileToSavedHeaderLogo,
  fileToSavedImageData,
  loadData,
  saveData,
  savedHeaderLogoToFile,
  savedImageDataToFile
} from './db';
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
  const [pageHeader, setPageHeader] = useState<string>('');
  const [headerLogo, setHeaderLogo] = useState<{ file: File; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await loadData();
        if (savedData) {
          // Restore images
          const restoredImages: ImageData[] = savedData.images.map((savedImage) => {
            const file = savedImageDataToFile(savedImage);
            return {
              id: `${Date.now()}-${Math.random()}`,
              file,
              url: URL.createObjectURL(file),
              caption: savedImage.caption
            };
          });
          setImages(restoredImages);

          // Restore page header
          setPageHeader(savedData.pageHeader);

          // Restore header logo
          if (savedData.headerLogo) {
            const file = savedHeaderLogoToFile(savedData.headerLogo);
            setHeaderLogo({
              file,
              url: URL.createObjectURL(file)
            });
          }
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    void loadSavedData();
  }, []);

  // Save data to IndexedDB whenever images, pageHeader, or headerLogo changes
  useEffect(() => {
    if (!isLoaded) return;

    const saveCurrentData = async () => {
      try {
        const imagesToSave = await Promise.all(
          images.map((image) => fileToSavedImageData(image.file, image.caption))
        );

        const logoToSave = headerLogo ? await fileToSavedHeaderLogo(headerLogo.file) : null;

        await saveData({
          images: imagesToSave,
          pageHeader,
          headerLogo: logoToSave
        });
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    };

    void saveCurrentData();
  }, [images, pageHeader, headerLogo, isLoaded]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
      if (headerLogo) {
        URL.revokeObjectURL(headerLogo.url);
      }
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

  /**
   * Handles logo file selection.
   * @param event - The change event from the file input
   */
  const handleLogoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clean up old logo URL if exists
    if (headerLogo) {
      URL.revokeObjectURL(headerLogo.url);
    }

    setHeaderLogo({
      file,
      url: URL.createObjectURL(file)
    });

    // Reset file input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  /**
   * Removes the header logo.
   */
  const handleRemoveLogo = () => {
    if (headerLogo) {
      URL.revokeObjectURL(headerLogo.url);
      setHeaderLogo(null);
    }
  };

  /**
   * Opens the logo file picker dialog.
   */
  const handleAddLogo = () => {
    logoInputRef.current?.click();
  };

  /**
   * Clears all data including images, header, and logo.
   */
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      // Clear images
      images.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
      setImages([]);

      // Clear header
      setPageHeader('');

      // Clear logo
      if (headerLogo) {
        URL.revokeObjectURL(headerLogo.url);
        setHeaderLogo(null);
      }

      // Clear from IndexedDB
      void clearData().catch((error: unknown) => {
        console.error('Failed to clear data:', error);
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Image Printer</h1>
        <p>Upload images, add captions, and print them in a formatted layout.</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlButtons}>
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

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoSelect}
            className={styles.fileInput}
            aria-label="Select header logo"
          />
          {headerLogo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={headerLogo.url}
                alt="Header logo preview"
                className={styles.logoPreviewImage}
              />
              <button
                onClick={handleRemoveLogo}
                className={styles.removeLogoButton}
                type="button"
                aria-label="Remove logo"
                tabIndex={-1}
              >
                Remove Logo
              </button>
            </>
          ) : (
            <button onClick={handleAddLogo} className={styles.button} type="button">
              Add Logo (Optional)
            </button>
          )}

          {images.length > 0 && (
            <button
              onClick={handlePrint}
              className={`btn-secondary ${styles.printButton}`}
              type="button"
            >
              Print ({images.length} {images.length === 1 ? 'image' : 'images'})
            </button>
          )}

          <button
            onClick={handleClearData}
            className={styles.button}
            type="button"
            aria-label="Clear all data"
          >
            Clear All Data
          </button>
        </div>

        <div className={styles.headerInputContainer}>
          <label htmlFor="pageHeader" className={styles.headerLabel}>
            Page Header (optional):
          </label>
          <textarea
            id="pageHeader"
            value={pageHeader}
            onChange={(e) => {
              setPageHeader(e.target.value);
            }}
            placeholder="Enter a header for each printed page..."
            className={styles.headerInput}
            aria-label="Page header"
            spellCheck={true}
          />
        </div>
      </div>

      {images.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No images added yet. Click "Add Images" to get started.</p>
        </div>
      ) : (
        <>
          {/* For the view where it is being edited */}
          <div className={styles.imageEditContainer}>
            {images.map((image) => (
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
                    tabIndex={-1}
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
          {/* For the view where it is being shown in print */}
          <div className={styles.pagesContainer}>
            {chunkArray(images, 2).map((pageImages, pageIndex, pages) => (
              <div key={pageIndex} className={styles.page}>
                {pageHeader || headerLogo ? (
                  <div className={`${styles.pageHeader} ${styles.printText}`}>
                    {headerLogo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={headerLogo.url}
                        alt="Header logo"
                        className={styles.headerLogoImage}
                      />
                    )}
                    {pageHeader && <div className={styles.headerText}>{pageHeader}</div>}
                  </div>
                ) : (
                  /* Empty div in the case of nothing */
                  <div></div>
                )}
                <div className={styles.pageContent}>
                  {pageImages.map((image) => (
                    <div key={image.id} className={styles.printImageCard}>
                      <div className={styles.printImageContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={image.caption || 'Uploaded image'}
                          className={styles.printImage}
                        />
                      </div>

                      {image.caption ? (
                        <span className={`${styles.printCaption} ${styles.printText}`}>
                          {image.caption}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className={`${styles.pageNumber} ${styles.printText}`}>
                  {pageIndex + 1}/{pages.length}
                </div>
              </div>
            ))}
          </div>
        </>
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
