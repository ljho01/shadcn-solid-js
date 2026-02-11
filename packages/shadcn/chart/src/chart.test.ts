import { describe, it, expect } from 'vitest';
import * as chart from './index';

describe('chart', () => {
  it('should export all components', () => {
    expect(chart.ChartContainer).toBeDefined();
    expect(chart.ChartTooltip).toBeDefined();
    expect(chart.ChartTooltipContent).toBeDefined();
    expect(chart.ChartLegend).toBeDefined();
    expect(chart.ChartLegendContent).toBeDefined();
    expect(chart.useChart).toBeDefined();
  });
});
