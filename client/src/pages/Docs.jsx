import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../sanityClient';

const Docs = ({ language }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const data = await getArticles();
                setArticles(data || []);
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    if (loading) return <div style={styles.container}>Loading...</div>;

    const isZh = language === 'zh';

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>{isZh ? '文档与文章' : 'DOCS & Articles'}</h1>
            <div style={styles.grid}>
                {articles.length > 0 ? (
                    articles.map((article) => (
                        <Link key={article.slug.current} to={`/docs/${article.slug.current}`} style={styles.card}>
                            <h2 style={styles.cardTitle}>
                                {isZh ? (article.title_zh || article.title_en) : (article.title_en || article.title_zh)}
                            </h2>
                            <p style={styles.date}>{new Date(article.publishedAt).toLocaleDateString()}</p>
                        </Link>
                    ))
                ) : (
                    <p style={styles.noData}>{isZh ? '暂无发布文章' : 'No articles published yet.'}</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', color: '#fff' },
    title: { fontSize: '2rem', marginBottom: '30px', textAlign: 'center' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' },
    cardTitle: { fontSize: '1.2rem', marginBottom: '10px' },
    date: { fontSize: '0.8rem', opacity: 0.5 },
    noData: { textAlign: 'center', opacity: 0.5, width: '100%' }
};

export default Docs;
