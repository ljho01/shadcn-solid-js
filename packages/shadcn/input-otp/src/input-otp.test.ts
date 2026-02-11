import { describe, it, expect } from 'vitest';
import * as inputOtp from './index';

describe('input-otp', () => {
  it('should export all components', () => {
    expect(inputOtp.InputOTP).toBeDefined();
    expect(inputOtp.InputOTPGroup).toBeDefined();
    expect(inputOtp.InputOTPSlot).toBeDefined();
    expect(inputOtp.InputOTPSeparator).toBeDefined();
    expect(inputOtp.InputOTPHiddenInput).toBeDefined();
  });
});
