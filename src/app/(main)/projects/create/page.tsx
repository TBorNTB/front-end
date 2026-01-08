import NewProjectForm from '../_components/NewProjectForm';

export const metadata = {
  title: '새 프로젝트 만들기',
  description: '새로운 프로젝트를 생성합니다.',
};

export default function NewProjectPage() {
  return (
    <>
      <div className="min-h-screen bg-background py-10">
        <div className="w-full px-3 sm:px-4 lg:px-10">
          <NewProjectForm />
        </div>
      </div>
    </>
  );
}
