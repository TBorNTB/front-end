import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
class ArticleStore {
  private store: Map<string, any>;

  constructor() {
    this.store = new Map();
  }

  set(id: string, data: any) {
    this.store.set(id, data);
  }

  get(id: string) {
    return this.store.get(id);
  }

  getAll() {
    return Array.from(this.store.values());
  }
}

const articlesStore = new ArticleStore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.category || !body.excerpt || !body.content) {
      return NextResponse.json(
        { message: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Validate tags
    if (!body.tags || body.tags.length === 0) {
      return NextResponse.json(
        { message: '최소 하나의 태그가 필요합니다.' },
        { status: 400 }
      );
    }

    const articleId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentDate = new Date().toISOString();

    // Create complete article object
    const newArticle = {
      id: articleId,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      category: body.category,
      tags: body.tags,
      thumbnailUrl: body.thumbnailUrl || '/api/placeholder/400/250',
      author: {
        nickname: '현재 사용자',
        bio: '',
      },
      date: currentDate.substring(0, 10).replace(/-/g, '.'),
      readTime: `${Math.ceil(body.content.length / 500)}분`,
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    // Store in memory (replace with database in production)
    articlesStore.set(articleId, newArticle);
    console.log('Article created and stored with ID:', articleId);
    console.log('Total articles in store:', articlesStore.getAll().length);

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { message: '글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
