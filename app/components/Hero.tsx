import Link from '$components/Link';
import socialLinks from '$shared/config/socialLinks';
import styles from './Hero.module.css';

/**
 * Hero section component that displays the main introduction and social links.
 * Features a personal introduction, professional background, and interactive social media icons.
 */
export default function Hero() {
  return (
    <div className={styles.hero}>
      <p className="header-4">
        <span>[Software Engineer]</span>
        <br />+
        <br />
        <i>&lt; Web Developer /&gt;</i>
      </p>
      <h1 className="header-2">Anton (Tony) Neuhold</h1>
      <p className={`header-6 ${styles.subtitle}`}>
        Hi! I'm a Senior Software Engineer with 4+ years of experience and a bachelors degree in
        Software Engineering from{' '}
        <Link
          url="https://www.asu.edu/"
          linkText="Arizona State University"
          ariaLabel="Arizona State University"
        />
        . I live in{' '}
        <Link
          url="https://www.google.com/maps/place/Canby,+OR+97013/@45.2711453,-122.7227492,13z"
          linkText="Canby, OR"
          ariaLabel="Canby, OR on Google Maps"
        />
        .
        <br />
        <br />
        When not working, or learning new things about development, I like to exercise and hang out
        with my three pets and beautiful wife. Check out some social media links and projects below:
      </p>

      <div className={styles.heroButtons}>
        {socialLinks.map((obj) => (
          <a
            key={obj.name}
            className={styles.svgLink}
            href={obj.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={obj.name}
            title={obj.name}
          >
            <svg className={styles.svgIcon} viewBox="0 0 24 24" role="img">
              <title>{obj.name}</title>
              <path d={obj.svgIconPath} />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
