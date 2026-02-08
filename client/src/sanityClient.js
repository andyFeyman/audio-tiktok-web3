import { createClient } from '@sanity/client';

export const client = createClient({
    projectId: '8umcztdp', // 用户需要在 Sanity 官网获取后填入
    dataset: 'production',
    useCdn: true, // 使用 CDN 缓存以提高加载速度
    apiVersion: '2024-02-06', // 使用当前日期
});

export const getArticles = async () => {
    const query = `*[_type == "post"] | order(publishedAt desc) {
    title_en,
    title_zh,
    slug,
    mainImage,
    publishedAt,
    body_en,
    body_zh,
    description_en,
    description_zh
  }`;
    return await client.fetch(query);
};

export const getArticleBySlug = async (slug) => {
    const query = `*[_type == "post" && slug.current == $slug][0] {
    title_en,
    title_zh,
    slug,
    mainImage,
    publishedAt,
    body_en,
    body_zh,
    description_en,
    description_zh
  }`;
    return await client.fetch(query, { slug });
};
