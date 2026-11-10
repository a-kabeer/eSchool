import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
}: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3.5">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            danger ? 'bg-light-error text-error' : 'bg-light-primary text-primary'
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </Modal>
  );
}
