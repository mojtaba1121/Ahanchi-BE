import { UserRole } from '../common/enums/user-role.enum';

export const DEFAULT_ROLES = [
  { code: UserRole.SUPER_ADMIN, titleFa: 'مدیر کل', descriptionFa: 'دسترسی کامل سامانه', permissions: ['*'] },
  { code: UserRole.MANAGER, titleFa: 'مدیر', descriptionFa: 'مدیریت نمایندگان، مواد و مشاهده گزارش‌ها', permissions: ['users:read', 'users:write', 'materials:write', 'reports:read', 'purchases:read', 'ledger:read'] },
  { code: UserRole.REPRESENTATIVE, titleFa: 'نماینده', descriptionFa: 'ثبت فروشنده، خرید و عملیات مالی حوزه خود', permissions: ['sellers:write', 'purchases:write', 'ledger:write', 'own-data:read'] },
];

export const DEFAULT_MATERIALS = [
  { code: 'IRON', nameFa: 'آهن', nameEn: 'Iron', color: '#455A64', sortOrder: 10 },
  { code: 'COPPER', nameFa: 'مس', nameEn: 'Copper', color: '#C56A3A', sortOrder: 20 },
  { code: 'ALUMINUM', nameFa: 'آلومینیوم', nameEn: 'Aluminum', color: '#90A4AE', sortOrder: 30 },
  { code: 'BRASS', nameFa: 'برنج', nameEn: 'Brass', color: '#C9A227', sortOrder: 40 },
  { code: 'CAST_IRON', nameFa: 'چدن', nameEn: 'Cast iron', color: '#37474F', sortOrder: 50 },
  { code: 'STAINLESS_STEEL', nameFa: 'استیل', nameEn: 'Stainless steel', color: '#78909C', sortOrder: 60 },
  { code: 'LEAD', nameFa: 'سرب', nameEn: 'Lead', color: '#5C6BC0', sortOrder: 70 },
  { code: 'ZINC', nameFa: 'روی', nameEn: 'Zinc', color: '#8D9BA8', sortOrder: 80 },
  { code: 'MIXED', nameFa: 'ضایعات مخلوط', nameEn: 'Mixed scrap', color: '#607D3B', sortOrder: 90 },
];
