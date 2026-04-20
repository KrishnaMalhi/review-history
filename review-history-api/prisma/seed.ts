import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedCountryData } from './seed-country-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── CITIES ──────────────────────────────────────────────
  const cities = await Promise.all([
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        nameEn: 'Karachi',
        nameUr: 'کراچی',
        province: 'Sindh',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        nameEn: 'Lahore',
        nameUr: 'لاہور',
        province: 'Punjab',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        nameEn: 'Islamabad',
        nameUr: 'اسلام آباد',
        province: 'Islamabad Capital Territory',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        nameEn: 'Rawalpindi',
        nameUr: 'راولپنڈی',
        province: 'Punjab',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000005' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000005',
        nameEn: 'Faisalabad',
        nameUr: 'فیصل آباد',
        province: 'Punjab',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000006' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000006',
        nameEn: 'Peshawar',
        nameUr: 'پشاور',
        province: 'Khyber Pakhtunkhwa',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000007' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000007',
        nameEn: 'Multan',
        nameUr: 'ملتان',
        province: 'Punjab',
      },
    }),
    prisma.city.upsert({
      where: { id: '00000000-0000-0000-0000-000000000008' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000008',
        nameEn: 'Quetta',
        nameUr: 'کوئٹہ',
        province: 'Balochistan',
      },
    }),
  ]);
  console.log(`✅ Seeded ${cities.length} cities`);

  // ─── LOCALITIES (sample for Karachi & Lahore) ─────────
  const localities = await Promise.all([
    // Karachi
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000001' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000001', cityId: cities[0].id, nameEn: 'DHA', nameUr: 'ڈی ایچ اے', postalCode: '75500' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000002' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000002', cityId: cities[0].id, nameEn: 'Gulshan-e-Iqbal', nameUr: 'گلشن اقبال', postalCode: '75300' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000003' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000003', cityId: cities[0].id, nameEn: 'Clifton', nameUr: 'کلفٹن', postalCode: '75600' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000004' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000004', cityId: cities[0].id, nameEn: 'North Nazimabad', nameUr: 'نارتھ ناظم آباد', postalCode: '74700' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000005' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000005', cityId: cities[0].id, nameEn: 'Saddar', nameUr: 'صدر', postalCode: '74400' } }),
    // Lahore
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000006' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000006', cityId: cities[1].id, nameEn: 'Johar Town', nameUr: 'جوہر ٹاؤن', postalCode: '54000' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000007' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000007', cityId: cities[1].id, nameEn: 'DHA Phase 5', nameUr: 'ڈی ایچ اے فیز 5', postalCode: '54792' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000008' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000008', cityId: cities[1].id, nameEn: 'Gulberg', nameUr: 'گلبرگ', postalCode: '54660' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000009' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000009', cityId: cities[1].id, nameEn: 'Model Town', nameUr: 'ماڈل ٹاؤن', postalCode: '54700' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000010' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000010', cityId: cities[1].id, nameEn: 'Bahria Town', nameUr: 'بحریہ ٹاؤن', postalCode: '53720' } }),
    // Islamabad
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000011' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000011', cityId: cities[2].id, nameEn: 'F-7', nameUr: 'ایف سیون', postalCode: '44000' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000012' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000012', cityId: cities[2].id, nameEn: 'G-11', nameUr: 'جی گیارہ', postalCode: '44000' } }),
    prisma.locality.upsert({ where: { id: '10000000-0000-0000-0000-000000000013' }, update: {}, create: { id: '10000000-0000-0000-0000-000000000013', cityId: cities[2].id, nameEn: 'Blue Area', nameUr: 'بلو ایریا', postalCode: '44000' } }),
  ]);
  console.log(`✅ Seeded ${localities.length} localities`);

  // ─── CATEGORIES ──────────────────────────────────────────
  const categoryData = [
    { id: '20000000-0000-0000-0000-000000000001', key: 'landlord', nameEn: 'Landlords / Property Owners', nameUr: 'مالک مکان / جائیداد مالکان', sortOrder: 1 },
    { id: '20000000-0000-0000-0000-000000000002', key: 'real_estate_agent', nameEn: 'Real Estate Agents / Dealers', nameUr: 'رئیل اسٹیٹ ایجنٹ / ڈیلر', sortOrder: 2 },
    { id: '20000000-0000-0000-0000-000000000003', key: 'doctor', nameEn: 'Doctors / Clinics', nameUr: 'ڈاکٹر / کلینک', sortOrder: 3 },
    { id: '20000000-0000-0000-0000-000000000004', key: 'mechanic', nameEn: 'Mechanics / Workshops', nameUr: 'مکینک / ورکشاپ', sortOrder: 4 },
    { id: '20000000-0000-0000-0000-000000000005', key: 'tutor', nameEn: 'Tutors / Academies', nameUr: 'ٹیوٹر / اکیڈمی', sortOrder: 5 },
    { id: '20000000-0000-0000-0000-000000000006', key: 'contractor', nameEn: 'Contractors / Builders', nameUr: 'ٹھیکیدار / بلڈر', sortOrder: 6 },
    { id: '20000000-0000-0000-0000-000000000007', key: 'employer', nameEn: 'Employers / Workplaces', nameUr: 'آجر / کام کی جگہ', sortOrder: 7 },
    { id: '20000000-0000-0000-0000-000000000008', key: 'local_business', nameEn: 'Local Businesses / Shops', nameUr: 'مقامی کاروبار / دکانیں', sortOrder: 8 },
    { id: '20000000-0000-0000-0000-000000000009', key: 'service_provider', nameEn: 'Service Providers', nameUr: 'سروس فراہم کنندگان', sortOrder: 9 },
    { id: '20000000-0000-0000-0000-000000000010', key: 'agency', nameEn: 'Agencies / Consultants / Brokers', nameUr: 'ایجنسیاں / مشیر / بروکر', sortOrder: 10 },
  ];

  const categories = await Promise.all(
    categoryData.map((c) =>
      prisma.category.upsert({ where: { id: c.id }, update: {}, create: c }),
    ),
  );
  console.log(`✅ Seeded ${categories.length} categories`);

  // ─── WARNING TAGS ────────────────────────────────────────
  const tagData = [
    // Landlord tags
    { id: '30000000-0000-0000-0000-000000000001', categoryId: categoryData[0].id, key: 'deposit_not_returned', labelEn: 'Deposit not returned', labelUr: 'امانت واپس نہیں کی', severityWeight: 4 },
    { id: '30000000-0000-0000-0000-000000000002', categoryId: categoryData[0].id, key: 'hidden_charges', labelEn: 'Hidden charges', labelUr: 'چھپے ہوئے چارجز', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000003', categoryId: categoryData[0].id, key: 'rude_behavior', labelEn: 'Rude behavior', labelUr: 'بدتمیزی', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000004', categoryId: categoryData[0].id, key: 'maintenance_ignored', labelEn: 'Maintenance ignored', labelUr: 'مرمت نظرانداز', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000005', categoryId: categoryData[0].id, key: 'eviction_pressure', labelEn: 'Sudden eviction pressure', labelUr: 'اچانک خالی کرنے کا دباؤ', severityWeight: 4 },
    { id: '30000000-0000-0000-0000-000000000006', categoryId: categoryData[0].id, key: 'unfair_rent_increase', labelEn: 'Unfair rent increase', labelUr: 'غیرمنصفانہ کرایہ اضافہ', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000007', categoryId: categoryData[0].id, key: 'cooperative_landlord', labelEn: 'Cooperative', labelUr: 'تعاون کرنے والا', severityWeight: 0, isPositive: true },
    { id: '30000000-0000-0000-0000-000000000008', categoryId: categoryData[0].id, key: 'fair_pricing_landlord', labelEn: 'Fair pricing', labelUr: 'مناسب قیمت', severityWeight: 0, isPositive: true },

    // Doctor/Clinic tags
    { id: '30000000-0000-0000-0000-000000000010', categoryId: categoryData[2].id, key: 'long_wait_time', labelEn: 'Long wait time', labelUr: 'بہت زیادہ انتظار', severityWeight: 1 },
    { id: '30000000-0000-0000-0000-000000000011', categoryId: categoryData[2].id, key: 'fee_not_transparent', labelEn: 'Fee not transparent', labelUr: 'فیس واضح نہیں', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000012', categoryId: categoryData[2].id, key: 'poor_communication', labelEn: 'Poor communication', labelUr: 'ناقص گفتگو', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000013', categoryId: categoryData[2].id, key: 'rushed_visit', labelEn: 'Rushed visit', labelUr: 'جلدی میں معائنہ', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000014', categoryId: categoryData[2].id, key: 'followup_issue', labelEn: 'Follow-up issue', labelUr: 'فالو اپ مسئلہ', severityWeight: 1 },
    { id: '30000000-0000-0000-0000-000000000015', categoryId: categoryData[2].id, key: 'professional_doctor', labelEn: 'Professional', labelUr: 'پیشہ ورانہ', severityWeight: 0, isPositive: true },
    { id: '30000000-0000-0000-0000-000000000016', categoryId: categoryData[2].id, key: 'clean_clinic', labelEn: 'Clean clinic', labelUr: 'صاف کلینک', severityWeight: 0, isPositive: true },

    // Mechanic tags
    { id: '30000000-0000-0000-0000-000000000020', categoryId: categoryData[3].id, key: 'overcharged', labelEn: 'Overcharged', labelUr: 'زیادہ پیسے لیے', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000021', categoryId: categoryData[3].id, key: 'problem_not_fixed', labelEn: 'Problem not fixed', labelUr: 'مسئلہ حل نہیں ہوا', severityWeight: 4 },
    { id: '30000000-0000-0000-0000-000000000022', categoryId: categoryData[3].id, key: 'delayed_delivery', labelEn: 'Delayed delivery', labelUr: 'تاخیر سے گاڑی دی', severityWeight: 1 },
    { id: '30000000-0000-0000-0000-000000000023', categoryId: categoryData[3].id, key: 'unauthorized_repair', labelEn: 'Unauthorized extra repair', labelUr: 'بغیر اجازت مرمت', severityWeight: 4 },
    { id: '30000000-0000-0000-0000-000000000024', categoryId: categoryData[3].id, key: 'poor_parts_quality', labelEn: 'Bad parts quality', labelUr: 'خراب پرزہ معیار', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000025', categoryId: categoryData[3].id, key: 'honest_mechanic', labelEn: 'Honest', labelUr: 'ایمانداری', severityWeight: 0, isPositive: true },

    // Tutor/Academy tags
    { id: '30000000-0000-0000-0000-000000000030', categoryId: categoryData[4].id, key: 'poor_teaching_quality', labelEn: 'Poor teaching quality', labelUr: 'کمزور پڑھائی', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000031', categoryId: categoryData[4].id, key: 'not_punctual', labelEn: 'Not punctual', labelUr: 'وقت کی پابندی نہیں', severityWeight: 1 },
    { id: '30000000-0000-0000-0000-000000000032', categoryId: categoryData[4].id, key: 'hidden_fee_issue', labelEn: 'Hidden fee issue', labelUr: 'چھپی ہوئی فیس', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000033', categoryId: categoryData[4].id, key: 'weak_communication', labelEn: 'Weak communication', labelUr: 'کمزور رابطہ', severityWeight: 1 },

    // Agency/Broker tags
    { id: '30000000-0000-0000-0000-000000000040', categoryId: categoryData[9].id, key: 'misleading_promise', labelEn: 'Misleading promise', labelUr: 'گمراہ کن وعدہ', severityWeight: 4 },
    { id: '30000000-0000-0000-0000-000000000041', categoryId: categoryData[9].id, key: 'slow_response', labelEn: 'Slow response', labelUr: 'سست جواب', severityWeight: 1 },
    { id: '30000000-0000-0000-0000-000000000042', categoryId: categoryData[9].id, key: 'upfront_payment_pressure', labelEn: 'Upfront payment pressure', labelUr: 'پہلے ادائیگی کا دباؤ', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000043', categoryId: categoryData[9].id, key: 'incomplete_delivery', labelEn: 'Incomplete delivery', labelUr: 'نامکمل سروس', severityWeight: 2 },

    // General positive tags for multiple categories
    { id: '30000000-0000-0000-0000-000000000050', categoryId: categoryData[8].id, key: 'responsive_service', labelEn: 'Responsive', labelUr: 'فوری جواب', severityWeight: 0, isPositive: true },
    { id: '30000000-0000-0000-0000-000000000051', categoryId: categoryData[8].id, key: 'transparent_pricing', labelEn: 'Transparent pricing', labelUr: 'واضح قیمت', severityWeight: 0, isPositive: true },
    { id: '30000000-0000-0000-0000-000000000052', categoryId: categoryData[8].id, key: 'punctual_service', labelEn: 'Punctual', labelUr: 'وقت کا پابند', severityWeight: 0, isPositive: true },
    { id: '30000000-0000-0000-0000-000000000053', categoryId: categoryData[7].id, key: 'good_customer_service', labelEn: 'Good customer service', labelUr: 'اچھی کسٹمر سروس', severityWeight: 0, isPositive: true },
    { id: '30000000-0000-0000-0000-000000000054', categoryId: categoryData[7].id, key: 'value_for_money', labelEn: 'Value for money', labelUr: 'پیسوں کی قدر', severityWeight: 0, isPositive: true },
    { id: '30000000-0000-0000-0000-000000000055', categoryId: categoryData[7].id, key: 'poor_quality', labelEn: 'Poor quality', labelUr: 'خراب کوالٹی', severityWeight: 2 },
    { id: '30000000-0000-0000-0000-000000000056', categoryId: categoryData[7].id, key: 'rude_staff', labelEn: 'Rude staff', labelUr: 'بدتمیز عملہ', severityWeight: 2 },
  ];

  const tags = await Promise.all(
    tagData.map((t) =>
      prisma.warningTag.upsert({
        where: { id: t.id },
        update: {},
        create: { ...t, isPositive: t.isPositive ?? false },
      }),
    ),
  );
  console.log(`✅ Seeded ${tags.length} warning tags`);
  // Admin user seeding
  const adminEmail = 'kirshna.malhi066@gmail.com';
  const adminPhone = '+923363598202';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Krishna!@12';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { phoneE164: adminPhone },
    update: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'admin',
      isPhoneVerified: true,
      status: 'active',
      displayName: 'Krishna Malhi',
    },
    create: {
      email: adminEmail,
      phoneE164: adminPhone,
      passwordHash: adminPasswordHash,
      role: 'admin',
      isPhoneVerified: true,
      status: 'active',
      displayName: 'Krishna Malhi',
    },
  });
  console.log(`✅ Admin seeded: ${adminUser.email} (${adminUser.phoneE164})`);
  await seedCountryData(prisma);
  console.log('✅ Country/State/City/Timezone data synced');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



