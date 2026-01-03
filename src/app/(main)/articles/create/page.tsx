import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewArticleForm from '../_components/NewArticleForm';

export const metadata = {
  title: '새 글 쓰기',
  description: '새로운 글을 작성합니다.',
};

export default function CreateArticlePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-10">
        <div className="w-full px-3 sm:px-4 lg:px-10">
          <NewArticleForm />
        </div>
      </div>
      <Footer />
    </>
  );
}
