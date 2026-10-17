import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../src/common/enums/user-role.enum';
import { CreateUserDto } from '../src/users/dto/create-user.dto';

function representative(overrides: Partial<CreateUserDto> = {}) {
  return Object.assign(new CreateUserDto(), {
    fullName: 'نماینده تست',
    phone: '09123456789',
    password: 'password123',
    role: UserRole.REPRESENTATIVE,
    ...overrides,
  });
}

describe('CreateUserDto', () => {
  it('requires city and village for representatives', async () => {
    const errors = await validate(representative());
    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['city', 'village']));
  });

  it('accepts a representative with city and village', async () => {
    await expect(validate(representative({ city: 'مشهد', village: 'طرقبه' }))).resolves.toHaveLength(0);
  });
});
