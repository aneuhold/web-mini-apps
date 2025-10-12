import Footer from '$components/Footer';
import Hero from '$components/Hero';
import Projects from '$components/Projects/Projects';

/**
 * Main page component that renders the portfolio layout.
 * Combines the Hero section, Projects section, and Footer into a cohesive homepage.
 */
export default function Page() {
  return (
    <main>
      <Hero />
      <Projects />
      <Footer />
    </main>
  );
}
