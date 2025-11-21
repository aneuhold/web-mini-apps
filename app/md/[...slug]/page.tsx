import fs from 'fs';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

/**
 * Renders a markdown page based on the slug.
 * @param props - The component props.
 */
export default async function MarkdownPage({ params }: PageProps) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'content/md', ...slug) + '.md';

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContent);

  return (
    <div className={styles.container}>
      <div className={styles.markdown}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

/**
 * Generates static params for all markdown files.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'content/md');

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const walkSync = (dir: string, fileList: string[] = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filepath = path.join(dir, file);
      if (fs.statSync(filepath).isDirectory()) {
        fileList = walkSync(filepath, fileList);
      } else {
        if (file.endsWith('.md')) {
          // Create relative path and split by separator to get slug array
          const relativePath = path.relative(contentDir, filepath);
          fileList.push(relativePath);
        }
      }
    });
    return fileList;
  };

  const files = walkSync(contentDir);

  return files.map((file) => ({
    slug: file.replace(/\.md$/, '').split(path.sep)
  }));
}
