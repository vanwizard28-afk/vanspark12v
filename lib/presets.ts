import { PRESET_APPLIANCES } from './electrical'
import { DEFAULT_STATE, type BuildState } from './build-state'

// Named starter builds — the "Start from" chips in the estimator, and the
// deep-link targets for ad-group landing pages (?build= encodes the same).
export const PRESET_BUILDS: { name: string; ids: string[] }[] = [
  { name: 'Weekender', ids: ['fridge', 'lights', 'usb', 'pump'] },
  { name: 'Off-grid family', ids: ['fridge', 'heater', 'lights', 'usb', 'fan', 'pump', 'laptop'] },
  { name: 'Induction kitchen', ids: ['fridge', 'heater', 'lights', 'usb', 'induction', 'invstandby'] },
  { name: 'Digital nomad', ids: ['fridge', 'lights', 'usb', 'starlink', 'laptop', 'fan'] },
]

// A fresh build with exactly the preset's appliances active — everything
// else resets to defaults so the chip is a clean "start from this template".
export function presetState(ids: string[]): BuildState {
  return {
    ...DEFAULT_STATE,
    appliances: PRESET_APPLIANCES.map((a) => ({ ...a, active: ids.includes(a.id) })),
  }
}
