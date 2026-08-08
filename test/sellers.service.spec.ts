import { Types } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../src/common/enums/user-role.enum';
import { AuthUser } from '../src/common/types/auth-user.type';
import { CreateSellerDto } from '../src/sellers/dto/create-seller.dto';
import { SellersService } from '../src/sellers/sellers.service';

vi.mock('../src/sellers/schemas/seller.schema', () => ({
  Seller: class Seller {},
}));

const user: AuthUser = {
  sub: '6a7706308438f63a93176343',
  phone: '09120000000',
  role: UserRole.REPRESENTATIVE,
  fullName: 'نماینده تست',
};

const dto: CreateSellerDto = {
  clientId: 'a5d49cd0-b2e5-4827-af82-3b0fae949e0f',
  fullName: 'ممد قلی',
  city: 'تهران',
};

function queryResult<T>(value: T) {
  return { lean: vi.fn().mockResolvedValue(value) };
}

describe('SellersService.create', () => {
  it('atomically creates or returns a seller by representative and client id', async () => {
    const seller = { _id: new Types.ObjectId(), ...dto, createdBy: new Types.ObjectId(user.sub) };
    const findOneAndUpdate = vi.fn().mockReturnValue(queryResult(seller));
    const model = { findOneAndUpdate };
    const service = new SellersService(model as never);

    await expect(service.create(dto, user)).resolves.toEqual(seller);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { createdBy: new Types.ObjectId(user.sub), clientId: dto.clientId },
      { $setOnInsert: { fullName: dto.fullName, city: dto.city } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );
  });

  it('returns the existing seller when concurrent upserts hit the unique index', async () => {
    const duplicateKey = Object.assign(new Error('duplicate key'), { code: 11000 });
    const existing = { _id: new Types.ObjectId(), ...dto, createdBy: new Types.ObjectId(user.sub) };
    const model = {
      findOneAndUpdate: vi.fn().mockReturnValue({ lean: vi.fn().mockRejectedValue(duplicateKey) }),
      findOne: vi.fn().mockReturnValue(queryResult(existing)),
    };
    const service = new SellersService(model as never);

    await expect(service.create(dto, user)).resolves.toEqual(existing);
    expect(model.findOne).toHaveBeenCalledWith({
      createdBy: new Types.ObjectId(user.sub),
      clientId: dto.clientId,
    });
  });

  it('does not hide unrelated database errors', async () => {
    const databaseError = new Error('database unavailable');
    const model = {
      findOneAndUpdate: vi.fn().mockReturnValue({ lean: vi.fn().mockRejectedValue(databaseError) }),
    };
    const service = new SellersService(model as never);

    await expect(service.create(dto, user)).rejects.toBe(databaseError);
  });
});

describe('SellersService.resolveForUser', () => {
  it('returns the seller found by its server id', async () => {
    const seller = { _id: new Types.ObjectId(), ...dto, createdBy: new Types.ObjectId(user.sub) };
    const model = { findOne: vi.fn().mockReturnValue(queryResult(seller)) };
    const service = new SellersService(model as never);

    await expect(service.resolveForUser(seller._id.toString(), dto.clientId, user)).resolves.toEqual(seller);
    expect(model.findOne).toHaveBeenCalledTimes(1);
  });

  it('falls back to the representative-scoped client id when the server id is stale', async () => {
    const seller = { _id: new Types.ObjectId(), ...dto, createdBy: new Types.ObjectId(user.sub) };
    const model = {
      findOne: vi.fn()
        .mockReturnValueOnce(queryResult(null))
        .mockReturnValueOnce(queryResult(seller)),
    };
    const service = new SellersService(model as never);

    await expect(service.resolveForUser(new Types.ObjectId().toString(), dto.clientId, user)).resolves.toEqual(seller);
    expect(model.findOne).toHaveBeenNthCalledWith(2, {
      createdBy: new Types.ObjectId(user.sub),
      clientId: dto.clientId,
    });
  });

  it('rejects a seller missing by both identifiers', async () => {
    const model = { findOne: vi.fn().mockReturnValue(queryResult(null)) };
    const service = new SellersService(model as never);

    await expect(service.resolveForUser(new Types.ObjectId().toString(), dto.clientId, user))
      .rejects.toThrow('فروشنده پیدا نشد');
  });
});
