/* eslint-disable @next/next/no-img-element */

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { profileService } from '@/lib/api/services/user-services';
import { getRoleBadgeColor, getRoleDisplayLabel } from '@/lib/role-utils';

type MemberProfile = {
  id: number;
  nickname: string;
  role: string;
  realName: string;
  email: string;
  username: string;
  description: string;
  techStack: string;
  githubUrl: string;
  linkedinUrl: string;
  blogUrl: string;
  profileImageUrl: string;
};

interface MemberPageProps {
  params: { username: string };
}

const normalizeTech = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length === 1) return trimmed.toUpperCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

const parseTechStack = (techStack?: string | null): string[] => {
  if (!techStack) return [];
  return techStack
    .split(',')
    .map((t) => normalizeTech(t))
    .filter(Boolean);
};

const isValidLink = (url?: string | null) => {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed === 'string' || trimmed === 'null' || trimmed === 'undefined') return false;
  return true;
};

export default function MemberProfilePage({ params }: MemberPageProps) {
  const username = useMemo(() => {
    try {
      return decodeURIComponent(params.username);
    } catch {
      return params.username;
    }
  }, [params.username]);

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const techTags = useMemo(() => parseTechStack(member?.techStack), [member?.techStack]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = (await profileService.getProfileByUsername(username)) as unknown as MemberProfile;
        if (!isMounted) return;
        setMember(data);
      } catch (err) {
        if (!isMounted) return;
        setMember(null);
        setErrorMessage(err instanceof Error ? err.message : '프로필 조회에 실패했습니다.');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    void run();
    return () => {
      isMounted = false;
    };
  }, [username]);

  return (
    <div className="container mx-auto px-6 sm:px-10 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">멤버 프로필</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
        <Link href="/members" className="text-sm text-primary-600 underline">
          멤버 목록으로
        </Link>
      </div>

      {isLoading ? (
        <div className="card p-6">로딩중...</div>
      ) : !member ? (
        <div className="card p-6">
          <p className="text-sm text-red-600">{errorMessage ?? '존재하지 않는 사용자입니다.'}</p>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={member.profileImageUrl}
                  alt={member.nickname || member.realName || member.username}
                  type="avatar"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {member.nickname || member.realName || member.username}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                  {getRoleDisplayLabel(member.role)}
                </span>
              </div>

              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">이메일:</span> {member.email}
                </p>
                <p>
                  <span className="font-medium text-foreground">소개:</span> {member.description || '-'}
                </p>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-foreground mb-2">기술스택:</div>
                {techTags.length === 0 ? (
                  <div className="text-sm text-muted-foreground">-</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {techTags.map((t) => (
                      <Badge key={t} variant="outline" size="sm">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {isValidLink(member.githubUrl) && (
                  <a className="text-sm text-primary-600 underline break-all" href={member.githubUrl} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                )}
                {isValidLink(member.linkedinUrl) && (
                  <a className="text-sm text-primary-600 underline break-all" href={member.linkedinUrl} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                )}
                {isValidLink(member.blogUrl) && (
                  <a className="text-sm text-primary-600 underline break-all" href={member.blogUrl} target="_blank" rel="noreferrer">
                    Blog
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
