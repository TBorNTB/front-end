import { UserProfile } from "@/types/user";
import { Icon } from "@/components/ui/icon-picker";
import Link from "next/link"; // Import the Link component

export default function ProfilePage() {
  const profile: UserProfile = {
    name: "김민준",
    nickname: "DevKim",
    email: "minjun.kim.dev@example.com",
    description:
      "웹 기술의 깊이를 탐구하는 것을 즐기는 프론트엔드 개발자입니다. 사용자 경험(UX)을 최우선으로 생각하며, 깨끗하고 확장 가능한 코드를 작성하기 위해 노력합니다. 현재는 Next.js와 TypeScript 생태계에 큰 관심을 가지고 있습니다.",
    techstack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Figma"],
    profileImageUrl: "https://i.pravatar.cc/150?u=user-001",
    githubUrl: "https://github.com/exampleuser",
  };
  return (
    <div className="mx-auto mt-4 flex h-fit max-w-5xl flex-col space-y-8 rounded-2xl bg-white p-4">
      <h2 className="text-4xl font-semibold">내 프로필</h2>
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <img
            src={profile.profileImageUrl}
            alt={profile.name}
            className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
          />
          <div className="text-center md:text-left">
            <h3 className="text-4xl font-bold">{profile.name}</h3>
            <p className="text-xl text-gray-500">@{profile.nickname}</p>
          </div>
        </div>

        {/* --- Edit Profile Button --- */}
        <Link
          href="/mypage/profile/edit" // This link points to the profile edit page
          className="flex h-10 items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-800/90"
        >
          <Icon name="file-pen-line" className="h-4 w-4" />
          수정하기
        </Link>
      </div>

      {/* --- Main Content --- */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Sidebar */}
        <div className="col-span-1 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Contact</h4>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Icon name="mail" className="h-4 w-4" />
            <a href={`mailto:${profile.email}`} className="hover:underline">
              {profile.email}
            </a>
          </div>
          {profile.githubUrl && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Icon name="github" className="h-4 w-4" />
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                View on GitHub
              </a>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="col-span-1 md:col-span-2">
          {/* Description */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800">About Me</h4>
            <p className="mt-2 whitespace-pre-wrap text-gray-600">{profile.description}</p>
          </div>

          {/* Tech Stack */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-800">Tech Stack</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.techstack.map((tech) => (
                <span key={tech} className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
