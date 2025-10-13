const DB_NAME = 'ImagePrinterDB';
const DB_VERSION = 1;
const STORE_NAME = 'printerData';
const DATA_KEY = 'savedData';

type SavedImageData = {
  fileName: string;
  fileType: string;
  fileData: ArrayBuffer;
  caption: string;
};

type SavedHeaderLogo = {
  fileName: string;
  fileType: string;
  fileData: ArrayBuffer;
};

export type SavedData = {
  images: SavedImageData[];
  pageHeader: string;
  headerLogo: SavedHeaderLogo | null;
};

/**
 * Opens the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(request.error?.message || 'Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Saves the printer data to IndexedDB.
 * @param data - The data to save
 */
export async function saveData(data: SavedData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, DATA_KEY);

    request.onerror = () => {
      reject(new Error(request.error?.message || 'Failed to save data'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Loads the printer data from IndexedDB.
 */
export async function loadData(): Promise<SavedData | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(DATA_KEY);

    request.onerror = () => {
      reject(new Error(request.error?.message || 'Failed to load data'));
    };

    request.onsuccess = () => {
      const result = request.result as SavedData | undefined;
      resolve(result || null);
    };
  });
}

/**
 * Clears all saved data from IndexedDB.
 */
export async function clearData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(DATA_KEY);

    request.onerror = () => {
      reject(new Error(request.error?.message || 'Failed to clear data'));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Converts a File to SavedImageData format.
 * @param file - The file to convert
 * @param caption - The caption for the image
 */
export async function fileToSavedImageData(file: File, caption: string): Promise<SavedImageData> {
  const arrayBuffer = await file.arrayBuffer();
  return {
    fileName: file.name,
    fileType: file.type,
    fileData: arrayBuffer,
    caption
  };
}

/**
 * Converts SavedImageData back to a File.
 * @param savedData - The saved image data
 */
export function savedImageDataToFile(savedData: SavedImageData): File {
  return new File([savedData.fileData], savedData.fileName, {
    type: savedData.fileType
  });
}

/**
 * Converts a File to SavedHeaderLogo format.
 * @param file - The file to convert
 */
export async function fileToSavedHeaderLogo(file: File): Promise<SavedHeaderLogo> {
  const arrayBuffer = await file.arrayBuffer();
  return {
    fileName: file.name,
    fileType: file.type,
    fileData: arrayBuffer
  };
}

/**
 * Converts SavedHeaderLogo back to a File.
 * @param savedData - The saved header logo data
 */
export function savedHeaderLogoToFile(savedData: SavedHeaderLogo): File {
  return new File([savedData.fileData], savedData.fileName, {
    type: savedData.fileType
  });
}
