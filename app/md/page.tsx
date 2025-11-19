import fs from 'fs';
import Link from 'next/link';
import path from 'path';
import styles from './page.module.css';

export default function MarkdownIndexPage() {
  const contentDir = path.join(process.cwd(), 'content/md');

  let files: string[] = [];
  if (fs.existsSync(contentDir)) {
    const walkSync = (dir: string, filelist: string[] = []) => {
      const dirFiles = fs.readdirSync(dir);
      dirFiles.forEach((file) => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
          filelist = walkSync(filepath, filelist);
        } else {
          if (file.endsWith('.md')) {
            const relativePath = path.relative(contentDir, filepath);
            filelist.push(relativePath);
          }
        }
      });
      return filelist;
    };
    files = walkSync(contentDir);
  }

  const pages = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    return {
      slug,
      title: slug.replace(/-/g, ' ').replace(/\//g, ' / '), // Simple title generation
      href: `/md/${slug}`
    };
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Markdown Pages</h1>
      <ul className={styles.list}>
        {pages.map((page) => (
          <li key={page.slug} className={styles.listItem}>
            <Link href={page.href} className={styles.link}>
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
