import { describe, expect, it } from 'vitest';
import { getDensityBand, ProteinDensityBand } from './fogoDensity';

describe('getDensityBand', () => {
  it('bands 13 g/100 kcal as Green (inclusive boundary)', () => {
    // 13 protein / 100 cal = exactly 13 per 100 kcal.
    expect(getDensityBand(100, 13)).toBe(ProteinDensityBand.Green);
  });

  it('bands 12.9 g/100 kcal as Yellow', () => {
    expect(getDensityBand(100, 12.9)).toBe(ProteinDensityBand.Yellow);
  });

  it('bands 8 g/100 kcal as Yellow (inclusive boundary)', () => {
    expect(getDensityBand(100, 8)).toBe(ProteinDensityBand.Yellow);
  });

  it('bands 7.9 g/100 kcal as Red', () => {
    expect(getDensityBand(100, 7.9)).toBe(ProteinDensityBand.Red);
  });

  it('bands anything under 15 cal as Free regardless of protein', () => {
    expect(getDensityBand(5, 0)).toBe(ProteinDensityBand.Free);
    expect(getDensityBand(14, 5)).toBe(ProteinDensityBand.Free);
  });

  it('bands 15 cal and up on protein density, not Free', () => {
    expect(getDensityBand(15, 3)).toBe(ProteinDensityBand.Green);
  });
});
