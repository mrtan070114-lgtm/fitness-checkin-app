"use client";

import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  message?: string;
  pendingText?: string;
};

const DEFAULT_CONFIRM_MESSAGE = "确定要解除绑定吗？解除后双方将不能互相查看记录。";

export function ConfirmSubmitButton({
  children,
  className = "danger-button",
  message = DEFAULT_CONFIRM_MESSAGE,
  pendingText = "处理中..."
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
