// Vercel Serverless API — 文章管理
// GET  /api/articles       → 获取文章列表
// POST /api/articles       → 创建文章
// DELETE /api/articles?id=X → 删除文章

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'articles');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

function readArticles() {
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (e) { return []; }
}

function writeArticles(articles) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), 'utf-8');
}

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const articles = readArticles();
            articles.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
            return res.status(200).json(articles);
        }

        if (req.method === 'POST') {
            const { title, content, summary, tags } = req.body || {};
            if (!title || !content) {
                return res.status(400).json({ error: 'title and content are required' });
            }

            const articles = readArticles();
            const now = new Date().toISOString();
            const slug = title
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'article';

            const article = {
                id: Date.now().toString(36),
                slug,
                title,
                content,
                summary: summary || content.substring(0, 150).replace(/<[^>]+>/g, ''),
                tags: tags || [],
                createdAt: now,
                updatedAt: now,
            };

            articles.unshift(article);
            writeArticles(articles);
            return res.status(201).json(article);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'id is required' });

            let articles = readArticles();
            articles = articles.filter(a => a.id !== id);
            writeArticles(articles);
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('API error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
