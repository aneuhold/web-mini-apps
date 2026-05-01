'use client';

import { useState } from 'react';
import { designPatterns } from './designPatternsData';
import styles from './page.module.css';

/**
 * Flash card application for learning software design patterns
 */
export default function DesignPatternsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentPattern = designPatterns[currentIndex];

  /**
   * Navigate to the next pattern
   */
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % designPatterns.length);
    setShowAnswer(false);
  };

  /**
   * Navigate to the previous pattern
   */
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + designPatterns.length) % designPatterns.length);
    setShowAnswer(false);
  };

  /**
   * Navigate to a random pattern
   */
  const handleRandom = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * designPatterns.length);
    } while (newIndex === currentIndex && designPatterns.length > 1);
    setCurrentIndex(newIndex);
    setShowAnswer(false);
  };

  /**
   * Toggle the visibility of the answer
   */
  const handleToggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  return (
    <div className={`papercss ${styles.container}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Design Patterns Flash Cards</h1>
        <p className={styles.subtitle}>Master software engineering design patterns</p>
      </header>

      <div className={styles.counter}>
        Card {currentIndex + 1} of {designPatterns.length}
      </div>

      <div className={styles.flashCard}>
        <div className={`${styles.categoryBadge} ${styles[currentPattern.category.toLowerCase()]}`}>
          {currentPattern.category}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Problem Scenario:</h3>
          <p className={styles.sectionContent}>{currentPattern.problem}</p>
        </div>

        {!showAnswer && (
          <button className={`${styles.button} ${styles.showButton}`} onClick={handleToggleAnswer}>
            Show Answer
          </button>
        )}

        {showAnswer && (
          <>
            <h2 className={styles.patternName}>{currentPattern.patternName}</h2>

            <p className={styles.description}>{currentPattern.description}</p>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Solution:</h3>
              <p className={styles.sectionContent}>{currentPattern.solution}</p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Example:</h3>
              <pre className={styles.codeBlock}>{currentPattern.example}</pre>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Common Use Cases:</h3>
              <ul className={styles.useCases}>
                {currentPattern.useCases.map((useCase, index) => (
                  <li key={index}>{useCase}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className={styles.controls}>
        <button className={styles.button} onClick={handlePrevious}>
          ← Previous
        </button>
        <button className={styles.button} onClick={handleRandom}>
          Random
        </button>
        {showAnswer && (
          <button
            className={`${styles.button} ${styles.toggleButton}`}
            onClick={handleToggleAnswer}
          >
            Hide Details
          </button>
        )}
        <button className={styles.button} onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}
