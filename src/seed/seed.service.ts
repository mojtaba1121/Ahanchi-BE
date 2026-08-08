import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { UserRole } from '../common/enums/user-role.enum';
import { Material } from '../materials/schemas/material.schema';
import { RoleDefinition } from '../roles/schemas/role-definition.schema';
import { User } from '../users/schemas/user.schema';
import { DEFAULT_MATERIALS, DEFAULT_ROLES } from './defaults';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Material.name) private readonly materials: Model<Material>,
    @InjectModel(RoleDefinition.name) private readonly roles: Model<RoleDefinition>,
  ) {}

  async onApplicationBootstrap() {
    if (this.config.get<string>('AUTO_SEED', 'true') === 'true') await this.run();
  }

  async run() {
    for (const role of DEFAULT_ROLES) {
      await this.roles.updateOne({ code: role.code }, { $set: role, $setOnInsert: { isSystem: true } }, { upsert: true });
    }
    for (const material of DEFAULT_MATERIALS) {
      await this.materials.updateOne({ code: material.code }, { $setOnInsert: { ...material, unit: 'kg', isActive: true } }, { upsert: true });
    }
    const phone = this.config.getOrThrow<string>('SEED_ADMIN_PHONE');
    if (!(await this.users.exists({ phone }))) {
      await this.users.create({
        fullName: this.config.get<string>('SEED_ADMIN_NAME', 'مدیر سیستم'),
        phone,
        passwordHash: await hash(this.config.getOrThrow<string>('SEED_ADMIN_PASSWORD'), 12),
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        mustChangePassword: true,
      });
      this.logger.warn(`Default admin created for ${phone}; change its password after first login.`);
    }
    this.logger.log(`Seed complete: ${DEFAULT_ROLES.length} roles and ${DEFAULT_MATERIALS.length} materials.`);
  }
}
