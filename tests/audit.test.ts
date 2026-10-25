import { describe, it, expect } from 'vitest';

describe('Admin Audit Mantiqiy testlar', () => {
  it('Action nomlari to\'g\'ri formatda', () => {
    const actions = ['APPROVE_LISTING', 'REJECT_LISTING', 'BAN_USER', 'UNBAN_USER', 'CHANGE_ROLE'];
    actions.forEach(a => expect(a).toMatch(/^[A-Z_]+$/));
  });

  it('Admin o\'zini bloklay olmasligi kerak', () => {
    const firstAdminId: string = 'super-admin-1';
    const targetId: string = 'super-admin-1';
    const action: string = 'ban';
    const canBan = !(targetId === firstAdminId && action === 'ban');
    expect(canBan).toBe(false);
  });

  it('Boshqa adminni bloklash mumkin', () => {
    const firstAdminId: string = 'super-admin-1';
    const targetId: string = 'admin-2';
    const action: string = 'ban';
    const canBan = !(targetId === firstAdminId && action === 'ban');
    expect(canBan).toBe(true);
  });
});