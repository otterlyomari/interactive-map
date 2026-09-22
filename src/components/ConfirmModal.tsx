import React from 'react';
import ReactDOM from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputPlaceholder?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showInput = false,
  inputValue = '',
  onInputChange,
  inputPlaceholder = '',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-80 shadow-2xl space-y-4 text-xs">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-slate-400 leading-relaxed">{message}</p>
        </div>

        {showInput && (
          <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={(e) => onInputChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm();
            }}
            placeholder={inputPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        )}

        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors font-medium cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors font-medium shadow-sm cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}