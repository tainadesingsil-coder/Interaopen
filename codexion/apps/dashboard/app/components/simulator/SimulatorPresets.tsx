'use client';

import type { PresetKey, SimulatorValues } from '@/app/types';

type Preset = { key: PresetKey; values: SimulatorValues };

type Props = {
  presets: Preset[];
  labels: Record<PresetKey, string>;
  activePreset: PresetKey;
  onSelect: (preset: Preset) => void;
};

export const SimulatorPresets = ({
  presets,
  labels,
  activePreset,
  onSelect,
}: Props) => (
  <div className='flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-start lg:overflow-visible'>
    {presets.map((preset) => {
      const presetLabel = labels[preset.key];
      return (
        <button
          key={preset.key}
          type='button'
          onClick={() => onSelect(preset)}
          className={`flex-shrink-0 rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.2em] transition ${
            activePreset === preset.key
              ? 'border-[var(--gold)]/60 bg-[var(--panel-strong)] text-white'
              : 'border-white/15 bg-white/5 text-white/70 hover:border-[var(--gold)]/40'
          }`}
        >
          {presetLabel}
        </button>
      );
    })}
  </div>
);
