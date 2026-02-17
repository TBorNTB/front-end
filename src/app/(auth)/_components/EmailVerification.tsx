"use client";

import { Dialog, Transition } from "@headlessui/react";
import { CheckCircle2, Loader2, MailCheck, RefreshCw, ShieldCheck, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { OTPInput } from "./OTPInput";
import { newsletterService } from "@/lib/api/services/newsletter-services";

type VerificationStatus = "idle" | "sending" | "sent" | "verifying" | "verified";

function isLikelyEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email.trim());
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

interface EmailVerificationProps {
  email: string;
  disabled?: boolean;
  /** 부모에서 인증 완료 여부를 받을 때 사용 (예: 회원가입 시 제출 방지) */
  onVerifiedChange?: (verified: boolean) => void;
}

export default function EmailVerification({ email, disabled = false, onVerifiedChange }: EmailVerificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentToEmail, setSentToEmail] = useState<string>("");
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);

  const emailOk = useMemo(() => isLikelyEmail(email), [email]);

  // If user edits email after sending/verifying, reset UI.
  useEffect(() => {
    if (!sentToEmail) return;
    if (email.trim() === sentToEmail) return;

    setStatus("idle");
    setOtp("");
    setError(null);
    setSentToEmail("");
    setTimeLeftSec(0);
    setIsOpen(false);
    onVerifiedChange?.(false);
  }, [email, sentToEmail, onVerifiedChange]);

  // Countdown timer (UI-only)
  useEffect(() => {
    if (status !== "sent") return;
    if (timeLeftSec <= 0) return;

    const id = window.setInterval(() => {
      setTimeLeftSec((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [status, timeLeftSec]);

  const openModal = () => {
    setIsOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsOpen(false);
    setError(null);
  };

  const simulateSend = async () => {
    if (!emailOk) {
      toast.error("올바른 이메일을 입력해주세요.");
      return;
    }

    setError(null);
    setOtp("");
    openModal();

    setStatus("sending");
    setSentToEmail(email.trim());

    try {
      // NOTE: 현재 백엔드에서 인증번호 발송 endpoint로 제공된 경로가
      // `/subscribers/verify/cancel` 이라서 그쪽을 사용합니다.
      const res = await newsletterService.cancelSendCode({ email: email.trim() });
      setStatus("sent");
      setTimeLeftSec(180);
      toast.success(res.message || "인증번호를 이메일로 전송했어요.");
    } catch (e: any) {
      setStatus("idle");
      setError(e?.message || "인증번호 전송에 실패했어요.");
      toast.error(e?.message || "인증번호 전송에 실패했어요.");
    }
  };

  const simulateResend = async () => {
    if (!emailOk) return;

    setError(null);
    setOtp("");
    setStatus("sending");

    try {
      const res = await newsletterService.cancelSendCode({ email: email.trim() });
      setStatus("sent");
      setTimeLeftSec(180);
      toast.success(res.message || "인증번호를 다시 전송했어요.");
    } catch (e: any) {
      setStatus("sent");
      setError(e?.message || "재전송에 실패했어요.");
      toast.error(e?.message || "재전송에 실패했어요.");
    }
  };

  const simulateVerify = async () => {
    setError(null);

    if (!otp || otp.length !== 6) {
      setError("인증번호 6자리를 입력해주세요.");
      return;
    }

    if (timeLeftSec <= 0) {
      setError("인증 시간이 만료됐어요. 재전송 후 다시 시도해주세요.");
      return;
    }

    setStatus("verifying");

    try {
      const res = await newsletterService.verifyEmail({ email: email.trim(), code: otp });
      setStatus("verified");
      setIsOpen(false);
      onVerifiedChange?.(true);
      toast.success(res.message || "이메일 인증 성공!");
    } catch (e: any) {
      setStatus("sent");
      setError(e?.message || "인증에 실패했어요.");
      toast.error(e?.message || "인증에 실패했어요.");
    }
  };

  const buttonLabel =
    status === "verified"
      ? "인증 완료"
      : status === "sending"
        ? "전송 중..."
        : status === "sent"
          ? "인증번호 입력"
          : "이메일 인증";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={status === "verified" ? "secondary" : "outline"}
          size="sm"
          disabled={disabled || (!emailOk && status === "idle") || status === "sending" || status === "verifying"}
          onClick={() => {
            if (status === "verified") return;
            if (status === "sent") {
              openModal();
              return;
            }
            void simulateSend();
          }}
          className="shrink-0"
        >
          {status === "verified" ? <CheckCircle2 className="size-4" /> : null}
          {status === "sending" || status === "verifying" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : status === "sent" ? (
            <ShieldCheck className="size-4" />
          ) : (
            <MailCheck className="size-4" />
          )}
          {buttonLabel}
        </Button>

        {status === "verified" ? (
          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
            인증된 이메일이에요
          </span>
        ) : status === "sent" ? (
          <span className="text-xs text-gray-600">
            남은 시간 <span className="font-semibold text-gray-900">{formatSeconds(timeLeftSec)}</span>
          </span>
        ) : null}
      </div>

      {status !== "idle" && status !== "verified" && sentToEmail ? (
        <p className="text-xs text-gray-500">
          <span className="font-medium">{sentToEmail}</span> 으로 인증번호를 보낼 거예요.
        </p>
      ) : null}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-200">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary-500 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Dialog.Title className="text-base font-bold text-gray-900">이메일 인증</Dialog.Title>
                        <p className="text-xs text-gray-600 mt-0.5">인증번호(6자리)를 입력해주세요.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white/60"
                      aria-label="닫기"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="px-5 py-5 space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                      <p className="text-sm text-blue-900 font-medium">인증번호가 발송됐어요</p>
                      <p className="text-xs text-blue-800 mt-1">
                        {sentToEmail || email.trim()} 로 전송된 인증번호를 입력해주세요.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600">
                        남은 시간 <span className="font-semibold text-gray-900">{formatSeconds(timeLeftSec)}</span>
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void simulateResend()}
                        disabled={status === "sending" || status === "verifying"}
                      >
                        <RefreshCw className="size-4" />
                        재전송
                      </Button>
                    </div>

                    <div className="pt-1">
                      <OTPInput
                        length={6}
                        value={otp}
                        onChange={(v) => {
                          setOtp(v);
                          if (error) setError(null);
                        }}
                        hasError={!!error}
                        autoFocus
                        disabled={status === "sending" || status === "verifying"}
                      />
                      {error ? <p className="text-xs text-red-600 mt-2 text-center">{error}</p> : null}
                      {timeLeftSec === 0 && status !== "verified" ? (
                        <p className="text-xs text-amber-700 mt-2 text-center">
                          인증 시간이 만료됐어요. 재전송 후 다시 입력해주세요.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" onClick={closeModal}>
                      닫기
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void simulateVerify()}
                      disabled={status === "sending" || status === "verifying"}
                    >
                      {status === "verifying" ? <Loader2 className="size-4 animate-spin" /> : null}
                      인증하기
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
