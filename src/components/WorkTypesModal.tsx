import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { WorkTypeItem, DEFAULT_WORK_TYPES } from '../utils/workTypes';

interface WorkTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  workTypes: WorkTypeItem[];
  onSaveWorkTypes: (types: WorkTypeItem[]) => void;
  onSelectType?: (typeName: string) => void;
}

export const WorkTypesModal: React.FC<WorkTypesModalProps> = ({
  isOpen,
  onClose,
  workTypes,
  onSaveWorkTypes,
  onSelectType,
}) => {
  const [newTypeName, setNewTypeName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTypeName.trim();
    if (!trimmed) {
      setError('Please enter a work type name');
      return;
    }

    if (workTypes.some((wt) => wt.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A work type with this name already exists');
      return;
    }

    const newItem: WorkTypeItem = {
      id: 'wt-' + Date.now(),
      name: trimmed,
      isCustom: true,
    };

    const updated = [...workTypes, newItem];
    onSaveWorkTypes(updated);
    setNewTypeName('');
    setError('');

    if (onSelectType) {
      onSelectType(trimmed);
    }
  };

  const startEdit = (item: WorkTypeItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setError('');
  };

  const saveEdit = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }

    const updated = workTypes.map((wt) => (wt.id === id ? { ...wt, name: trimmed } : wt));
    onSaveWorkTypes(updated);
    setEditingId(null);
    setEditingName('');
    setError('');
  };

  const handleDelete = (id: string) => {
    if (workTypes.length <= 1) {
      setError('Must keep at least one work type');
      return;
    }
    const updated = workTypes.filter((wt) => wt.id !== id);
    onSaveWorkTypes(updated);
    setError('');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset work types list to default categories?')) {
      onSaveWorkTypes(DEFAULT_WORK_TYPES);
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Manage Work Types (職種・カテゴリ)</h3>
              <p className="text-xs text-slate-500">Add, edit, or customize part-time job categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add New Work Type Input */}
          <form onSubmit={handleAddType} className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Add New Work Type
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g. Delivery (デリバリー), Barista (バリスタ)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 text-sm font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Type</span>
              </button>
            </div>
          </form>

          {/* Existing Work Types List */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Available Work Types ({workTypes.length})
              </span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {workTypes.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-200 transition flex items-center justify-between gap-2"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-blue-400 bg-white text-xs font-semibold outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(item.id)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                          title="Save change"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{item.name}</span>
                          {item.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase">
                              Custom
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {onSelectType && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectType(item.name);
                                onClose();
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-md transition"
                            >
                              Select
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition"
                            title="Edit name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            title="Delete type"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
