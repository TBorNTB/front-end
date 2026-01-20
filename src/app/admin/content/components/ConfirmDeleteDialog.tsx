"use client";


type ConfirmDeleteDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  itemLabel?: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteDialog({
  open,
  title,
  description,
  itemLabel,
  confirmLabel = "삭제",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onCancel} />

      <div className="relative w-[92vw] max-w-lg rounded-xl bg-white border border-gray-200 shadow-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
          {itemLabel && (
            <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-800">
              {itemLabel}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="admin-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="admin-btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "삭제 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
