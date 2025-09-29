"use client";

import { useState } from "react";
import { UserProfile } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Icon } from "@/components/ui/icon-picker";

// In a real application, this data would be fetched from your server
const currentProfile: UserProfile = {
  name: "김민준",
  nickname: "DevKim",
  email: "minjun.kim.dev@example.com",
  description:
    "웹 기술의 깊이를 탐구하는 것을 즐기는 프론트엔드 개발자입니다. 사용자 경험(UX)을 최우선으로 생각하며, 깨끗하고 확장 가능한 코드를 작성하기 위해 노력합니다. 현재는 Next.js와 TypeScript 생태계에 큰 관심을 가지고 있습니다.",
  techstack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Figma"],
  profileImageUrl: "https://i.pravatar.cc/150?u=user-001",
  githubUrl: "https://github.com/exampleuser",
};

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    ...currentProfile,
    techstack: currentProfile.techstack.join(", "),
  });
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // Store the file object for submission
      const reader = new FileReader();
      reader.onloadend = () => {
        // Show a preview of the new image
        setNewProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would upload the `imageFile` if it exists
    // and then save the returned URL.
    const submissionData = {
      ...formData,
      techstack: formData.techstack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      profileImageUrl: newProfileImage || formData.profileImageUrl,
    };
    console.log("Submitting Text Data:", submissionData);
    console.log("Submitting Image File:", imageFile);
    alert("프로필이 저장되었습니다! (콘솔에서 데이터를 확인하세요)");
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 rounded-2xl bg-white p-4 md:p-8">
      {/* Header section with improved layout */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div>
          <h1 className="text-3xl font-bold">프로필 수정</h1>
          <p className="text-gray-500">회원님의 정보를 수정해주세요.</p>
        </div>
        <div className="relative">
          <img
            src={newProfileImage || formData.profileImageUrl}
            alt={formData.name}
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
          />
          <Label
            htmlFor="profileImageUpload"
            className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-gray-700 p-1 text-gray-50 transition-colors hover:bg-gray-600"
          >
            <Icon name="camera" className="h-4 w-4" />
            <Input
              type="file"
              id="profileImageUpload"
              className="sr-only"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Label>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="nickname">닉네임</Label>
            <Input id="nickname" name="nickname" value={formData.nickname} onChange={handleChange} />
          </div>
        </div>

        <div>
          <Label htmlFor="description">자기소개</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} />
        </div>

        <div>
          <Label htmlFor="techstack">기술 스택 (쉼표로 구분)</Label>
          <Input
            id="techstack"
            name="techstack"
            value={formData.techstack}
            onChange={handleChange}
            placeholder="예: React, Next.js, TypeScript"
          />
        </div>

        <div>
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            value={formData.githubUrl || ""}
            onChange={handleChange}
            placeholder="https://github.com/your-username"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button asChild type="button" variant="outline">
          <Link href="/mypage/profile">취소</Link>
        </Button>
        <Button type="submit">변경사항 저장</Button>
      </div>
    </form>
  );
}
