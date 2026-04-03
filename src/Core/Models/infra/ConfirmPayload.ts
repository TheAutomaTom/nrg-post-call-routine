export interface ConfirmPayload {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmType?: "primary" | "error" | "warning" | "success" | "info";
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type ModalPayload = ConfirmPayload | Record<string, unknown> | null;
