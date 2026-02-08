import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug } from '../sanityClient';
import { PortableText } from '@portabletext/react';

import { Helmet } from 'react-helmet-async';

const ArticleDetail = ({ language }) => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const data = await getArticleBySlug(slug);
                setArticle(data);
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug]);

    if (loading) return <div style={styles.container}>Loading...</div>;

    const isZh = language === 'zh';

    if (!article) {
        return (
            <div style={styles.container}>
                {isZh ? '未找到文章。' : 'Article not found.'}{' '}
                <Link to="/docs" style={{ color: '#fff' }}>
                    {isZh ? '返回文档' : 'Back to DOCS'}
                </Link>
            </div>
        );
    }

    const title = isZh ? (article.title_zh || article.title_en) : (article.title_en || article.title_zh);
    const body = isZh ? (article.body_zh || article.body_en) : (article.body_en || article.body_zh);
    const description = isZh ? (article.description_zh || article.description_en) : (article.description_en || article.description_zh);

    return (
        <article style={styles.container}>
            <Helmet>
                <title>{title} - AutoSuggestion</title>
                {description && <meta name="description" content={description} />}
            </Helmet>
            <Link to="/docs" style={styles.backLink}>
                {isZh ? '← 返回文档' : '← Back to DOCS'}
            </Link>
            <header>
                <h1 style={styles.title}>{title}</h1>
                <p style={styles.meta}>
                    By Admin • {new Date(article.publishedAt).toLocaleDateString()}
                </p>
            </header>
            <div style={styles.content}>
                <PortableText value={body} />
            </div>
        </article>
    );
};

const styles = {
    container: { padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: '#fff' },
    backLink: { display: 'block', marginBottom: '20px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
    title: { fontSize: '2.5rem', marginBottom: '10px' },
    meta: { fontSize: '0.9rem', opacity: 0.6, marginBottom: '40px' },
    content: { lineHeight: '1.8', fontSize: '1.1rem', color: '#ccc' }
};

export default ArticleDetail;
