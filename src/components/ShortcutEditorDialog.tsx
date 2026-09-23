import { useState, type FormEvent } from 'react';
import type { Shortcut } from '../types';
import { Modal } from './Dialog';

interface ShortcutEditorDialogProps {
  shortcut?: Shortcut;
  onSubmit: (data: { name: string; url: string }) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ShortcutEditorDialog({ shortcut, onSubmit, onDelete, onClose }: ShortcutEditorDialogProps) {
  const [name, setName] = useState(shortcut?.name ?? '');
  const [url, setUrl] = useState(shortcut?.url ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName) {
      setError('请填写名称。');
      return;
    }
    if (!trimmedUrl) {
      setError('请填写网址。');
      return;
    }
    const normalized = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl.replace(/^\/+/, '')}`;
    try {
      new URL(normalized);
    } catch {
      setError('网址格式不正确，示例：https://www.example.com');
      return;
    }
    onSubmit({ name: trimmedName, url: normalized });
  };

  return (
    <Modal title={shortcut ? '编辑捷径' : '添加捷径'} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field">
          <span className="field__label">名称</span>
          <input
            className="text-field"
            value={name}
            maxLength={14}
            placeholder="例如：哔哩哔哩"
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">网址</span>
          <input
            className="text-field"
            value={url}
            inputMode="url"
            placeholder="https://www.bilibili.com"
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        {error ? <p className="field__error">{error}</p> : null}
        <div className="modal__actions">
          {shortcut ? (
            <button type="button" className="pill-button pill-button--danger" onClick={onDelete}>
              删除
            </button>
          ) : null}
          <button type="button" className="pill-button" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="pill-button pill-button--primary">
            保存
          </button>
        </div>
      </form>
    </Modal>
  );
}
