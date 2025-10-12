import Picture from 'next-export-optimize-images/picture';
import { type StaticImageData } from 'next/image';
import AnimatedBorderBackground from '../AnimatedBorderBackground';
import TextButton from '../TextButton';
import styles from './Project.module.css';

type ProjectProps = {
  /** The project title/heading */
  title: string;
  /** Detailed description of the project */
  info: string;
  /** Static image data for the project thumbnail */
  imgSrc: StaticImageData;
  /** Alt text for the project image */
  imgAlt: string;
  /** Optional URL to the live demo (if available) */
  demoLink?: string;
  /** URL to the source code repository */
  codeLink: string;
  /** Whether this image should be loaded with priority (for above-the-fold content) */
  priority?: boolean;
};

/**
 * Individual project card component that displays project information.
 * Shows project image, title, description, and action buttons for demo and source code.
 */
export default function Project({
  title,
  info,
  imgSrc,
  imgAlt,
  demoLink,
  codeLink,
  priority = false
}: ProjectProps) {
  return (
    <AnimatedBorderBackground className={styles.projectCardBorder}>
      <article className={styles.projectCard}>
        <div className={styles.media} aria-label={imgAlt}>
          <Picture
            className={styles.enhancedImage}
            src={imgSrc}
            alt={imgAlt}
            placeholder="blur"
            fill
            sizes="(min-resolution: 2x) 600px, 300px"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            quality={90} // High quality for portfolio images
          />
        </div>
        <div className={styles.textContent}>
          <h3 className="header-4">{title}</h3>
          <p>{info}</p>
        </div>
        <div className={styles.footer}>
          {demoLink ? <TextButton text="demo" url={demoLink} /> : null}
          <TextButton text="source" url={codeLink} />
        </div>
      </article>
    </AnimatedBorderBackground>
  );
}
