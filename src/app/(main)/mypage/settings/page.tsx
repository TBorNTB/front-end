"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Eye, EyeOff, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProfilePublic, setIsProfilePublic] = useState(true);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    // API call to change password would go here
    console.log("Changing password...");
    alert("비밀번호가 변경되었습니다.");
  };

  const handleAccountDeletion = () => {
    if (window.confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      // API call to delete account would go here
      console.log("Deleting account...");
      alert("계정이 삭제되었습니다.");
    }
  };

  return (
    <div className="w-full max-w-4xl p-8 space-y-12">
      <h1 className="text-3xl font-bold text-gray-800">계정 설정</h1>

      {/* Password Change Section */}
      <section className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <ShieldCheck className="text-blue-600" />
          비밀번호 변경
        </h2>
        <p className="text-gray-500 mt-2 mb-6">
          보안을 위해 주기적으로 비밀번호를 변경하는 것을 권장합니다.
        </p>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="font-medium text-gray-600">현재 비밀번호</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="md:col-span-2"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="font-medium text-gray-600">새 비밀번호</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="md:col-span-2"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="font-medium text-gray-600">새 비밀번호 확인</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="md:col-span-2"
              required
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">비밀번호 변경</Button>
          </div>
        </form>
      </section>

      {/* Account Deletion Section */}
      <section className="p-6 border border-red-200 rounded-lg bg-red-50 shadow-sm mb-15">
        <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2">
          <Trash2 />
          회원 탈퇴
        </h2>
        <p className="text-red-600 mt-2 mb-6">
          계정을 삭제하면 모든 활동 내역과 데이터가 영구적으로 사라지며, 복구할 수 없습니다.
        </p>
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleAccountDeletion}>
            계정 영구 삭제
          </Button>
        </div>
      </section>
    </div>
  );
}
