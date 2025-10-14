'use client';

import { useMemo, useState } from 'react';
import styles from './page.module.css';

type ContentType = 'text' | 'image';
type ImageSize = 'smaller' | 'same' | 'larger';

type CssConstraint = {
  id: string;
  name: string;
  className: string;
  enabled: boolean;
};

/**
 * CSS Height Tester page component.
 * Allows users to experiment with different CSS height constraints and their priority.
 */
export default function Page() {
  const [containerHeight, setContainerHeight] = useState<string>('300px');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [imageSize, setImageSize] = useState<ImageSize>('same');
  const [constraints, setConstraints] = useState<CssConstraint[]>([
    { id: '1', name: 'Grid Layout', className: 'constrainByGrid', enabled: false },
    { id: '2', name: 'Flexbox Layout', className: 'constrainByFlex', enabled: false },
    { id: '3', name: 'Max Height (200px)', className: 'constrainMaxHeight', enabled: false },
    { id: '4', name: 'Min Height', className: 'constrainMinHeight', enabled: false },
    { id: '5', name: 'Absolute Position', className: 'constrainByAbsolute', enabled: false }
  ]);

  /**
   * Toggles a constraint on or off.
   * @param id - The unique identifier for the constraint
   */
  const toggleConstraint = (id: string) => {
    setConstraints((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  /**
   * Moves a constraint up in the list.
   * @param index - The current index of the constraint
   */
  const moveConstraintUp = (index: number) => {
    if (index === 0) return;
    setConstraints((prev) => {
      const newConstraints = [...prev];
      [newConstraints[index - 1], newConstraints[index]] = [
        newConstraints[index],
        newConstraints[index - 1]
      ];
      return newConstraints;
    });
  };

  /**
   * Moves a constraint down in the list.
   * @param index - The current index of the constraint
   */
  const moveConstraintDown = (index: number) => {
    if (index === constraints.length - 1) return;
    setConstraints((prev) => {
      const newConstraints = [...prev];
      [newConstraints[index], newConstraints[index + 1]] = [
        newConstraints[index + 1],
        newConstraints[index]
      ];
      return newConstraints;
    });
  };

  // Build class names for the container and content
  const containerClasses = useMemo<string>(() => {
    return [
      styles.exampleContainer,
      ...constraints.filter((c) => c.enabled).map((c) => styles[c.className])
    ].join(' ');
  }, [constraints]);

  const contentClasses = [
    styles.exampleContent,
    contentType === 'image' ? styles.imageContent : styles.textContent
  ].join(' ');

  // Calculate image dimensions based on size setting
  const getImageDimensions = () => {
    const baseSize = 600;
    switch (imageSize) {
      case 'smaller':
        return { width: Math.round(baseSize * 0.6), height: Math.round(baseSize * 0.6) };
      case 'same':
        return { width: baseSize, height: baseSize };
      case 'larger':
        return { width: Math.round(baseSize * 1.5), height: Math.round(baseSize * 1.5) };
    }
  };

  const imageDims = getImageDimensions();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>CSS Height Priority Tester</h1>
        <p className={styles.description}>
          Experiment with different CSS height constraints to understand how they interact and which
          ones take priority. Toggle constraints on/off and reorder them to see how the declaration
          order affects the final result.
        </p>
      </div>

      <div className={styles.content}>
        {/* Left side: Configuration */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Configuration</h2>

          {/* Container Height Input */}
          <div className={styles.configSection}>
            <label htmlFor="containerHeight" className={styles.label}>
              Container Height:
            </label>
            <input
              id="containerHeight"
              type="text"
              value={containerHeight}
              onChange={(e) => {
                setContainerHeight(e.target.value);
              }}
              className={styles.input}
              placeholder="e.g., 300px, 50vh, 100%"
            />
          </div>

          {/* Content Type Radio */}
          <div className={styles.configSection}>
            <label className={styles.label}>Content Type:</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="text"
                  checked={contentType === 'text'}
                  onChange={(e) => {
                    setContentType(e.target.value as ContentType);
                  }}
                />
                Text
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  value="image"
                  checked={contentType === 'image'}
                  onChange={(e) => {
                    setContentType(e.target.value as ContentType);
                  }}
                />
                Image
              </label>
            </div>
          </div>

          {/* Image Size Options (only shown when image is selected) */}
          {contentType === 'image' && (
            <div className={styles.configSection}>
              <label className={styles.label}>Image Size:</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="smaller"
                    checked={imageSize === 'smaller'}
                    onChange={(e) => {
                      setImageSize(e.target.value as ImageSize);
                    }}
                  />
                  Smaller (60%)
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="same"
                    checked={imageSize === 'same'}
                    onChange={(e) => {
                      setImageSize(e.target.value as ImageSize);
                    }}
                  />
                  Same (100%)
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    value="larger"
                    checked={imageSize === 'larger'}
                    onChange={(e) => {
                      setImageSize(e.target.value as ImageSize);
                    }}
                  />
                  Larger (150%)
                </label>
              </div>
            </div>
          )}

          {/* CSS Constraints */}
          <div className={styles.configSection}>
            <label className={styles.label}>CSS Constraints:</label>
            <div className={styles.constraintsList}>
              {constraints.map((constraint, index) => (
                <div key={constraint.id} className={styles.constraintItem}>
                  <div className={styles.constraintControls}>
                    <button
                      onClick={() => {
                        moveConstraintUp(index);
                      }}
                      disabled={index === 0}
                      className={styles.moveButton}
                      type="button"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => {
                        moveConstraintDown(index);
                      }}
                      disabled={index === constraints.length - 1}
                      className={styles.moveButton}
                      type="button"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <label className={styles.constraintLabel}>
                    <input
                      type="checkbox"
                      checked={constraint.enabled}
                      onChange={() => {
                        toggleConstraint(constraint.id);
                      }}
                    />
                    {constraint.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Example Output */}
        <div className={styles.examplePanel}>
          <h2 className={styles.sectionTitle}>Output</h2>
          <div className={styles.exampleWrapper}>
            <div className={containerClasses} style={{ height: containerHeight }}>
              <div className={contentClasses}>
                {contentType === 'text' ? (
                  <p>
                    This is sample text content. The container height is set to{' '}
                    <strong>{containerHeight}</strong>. Active constraints:{' '}
                    {constraints.filter((c) => c.enabled).length > 0
                      ? constraints
                          .filter((c) => c.enabled)
                          .map((c) => c.name)
                          .join(', ')
                      : 'None'}
                  </p>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://placehold.co/${imageDims.width}x${imageDims.height}/blue/white?text=${imageSize}`}
                    alt={`${imageSize} placeholder`}
                    className={styles.image}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
