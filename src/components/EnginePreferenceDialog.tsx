import type { EngineId } from '../types';
import { ENGINES } from '../data/engines';
import { Modal } from './Dialog';
import { EngineMark, IconCheck } from './icons';
import './EnginePreferenceDialog.css';

interface EnginePreferenceDialogProps {
  current: EngineId;
  onChange: (id: EngineId) => void;
  onClose: () => void;
}

export function EnginePreferenceDialog({ current, onChange, onClose }: EnginePreferenceDialogProps) {
  return (
    <Modal title="搜索引擎偏好" onClose={onClose}>
      <p className="modal__section">默认搜索引擎</p>
      <div className="engine-list" role="radiogroup" aria-label="默认搜索引擎">
        {ENGINES.map((engine) => {
          const selected = engine.id === current;
          return (
            <button
              key={engine.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`engine-option${selected ? ' is-selected' : ''}`}
              onClick={() => onChange(engine.id)}
            >
              <span className="engine-option__icon">
                <EngineMark id={engine.id} size={16} />
              </span>
              <span className="engine-option__name">{engine.name}</span>
              <span className="engine-option__hint">{selected ? <IconCheck size={14} /> : engine.hint}</span>
            </button>
          );
        })}
      </div>
      <p className="engine-tip">在搜索框内按 Alt+1 ~ Alt+6 可以快速切换搜索引擎。</p>
      <div className="modal__actions">
        <button type="button" className="pill-button pill-button--primary" onClick={onClose}>
          完成
        </button>
      </div>
    </Modal>
  );
}
