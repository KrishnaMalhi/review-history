import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { sanitizeInput } from '../../common/utils/helpers';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

/**
 * CategoryExtensionsService handles profile CRUD and review data creation
 * for all vertical-specific extensions (school, medical, product).
 * Employer profiles are handled by the dedicated EmployerProfilesModule.
 *
 * Routing is based on the entity's category key.
 */

// Category keys that map to each vertical
const SCHOOL_CATEGORIES = ['school', 'college', 'university', 'madrasa'];
const MEDICAL_CATEGORIES = ['doctor', 'hospital', 'clinic', 'dentist'];
const PRODUCT_CATEGORIES = ['food_product', 'product'];
const EMPLOYER_CATEGORIES = ['employer', 'workplace', 'workspace', 'company'];

@Injectable()
export class CategoryExtensionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Profile CRUD ─────────────────────────────

  async getProfile(entityId: string) {
    const entity = await this.getEntityWithCategory(entityId);
    const categoryKey = entity.category.key;

    if (SCHOOL_CATEGORIES.includes(categoryKey)) {
      return this.getSchoolProfile(entityId);
    }
    if (MEDICAL_CATEGORIES.includes(categoryKey)) {
      return this.getMedicalProfile(entityId);
    }
    if (PRODUCT_CATEGORIES.includes(categoryKey)) {
      return this.getProductProfile(entityId);
    }
    return null; // General categories don't have extended profiles
  }

  async createProfile(entityId: string, data: any, userId: string) {
    const entity = await this.getEntityWithCategory(entityId);
    await this.verifyOwnership(entityId, userId);
    const categoryKey = entity.category.key;

    if (SCHOOL_CATEGORIES.includes(categoryKey)) {
      return this.createSchoolProfile(entityId, data);
    }
    if (MEDICAL_CATEGORIES.includes(categoryKey)) {
      return this.createMedicalProfile(entityId, data);
    }
    if (PRODUCT_CATEGORIES.includes(categoryKey)) {
      return this.createProductProfile(entityId, data);
    }
    return null;
  }

  async updateProfile(entityId: string, data: any, userId: string) {
    const entity = await this.getEntityWithCategory(entityId);
    await this.verifyOwnership(entityId, userId);
    const categoryKey = entity.category.key;

    if (SCHOOL_CATEGORIES.includes(categoryKey)) {
      return this.updateSchoolProfile(entityId, data);
    }
    if (MEDICAL_CATEGORIES.includes(categoryKey)) {
      return this.updateMedicalProfile(entityId, data);
    }
    if (PRODUCT_CATEGORIES.includes(categoryKey)) {
      return this.updateProductProfile(entityId, data);
    }
    return null;
  }

  // ─── Review Data Creation ─────────────────────

  async createReviewData(reviewId: string, categoryKey: string, data: any) {
    if (!data || Object.keys(data).length === 0) return null;

    if (EMPLOYER_CATEGORIES.includes(categoryKey)) {
      return this.createWorkplaceReviewData(reviewId, data);
    }
    if (SCHOOL_CATEGORIES.includes(categoryKey)) {
      return this.createSchoolReviewData(reviewId, data);
    }
    if (MEDICAL_CATEGORIES.includes(categoryKey)) {
      return this.createMedicalReviewData(reviewId, data);
    }
    if (PRODUCT_CATEGORIES.includes(categoryKey)) {
      return this.createProductReviewData(reviewId, data);
    }
    return null;
  }

  async getReviewData(reviewId: string, categoryKey: string) {
    if (EMPLOYER_CATEGORIES.includes(categoryKey)) {
      return this.prisma.workplaceReviewData.findUnique({ where: { reviewId } });
    }
    if (SCHOOL_CATEGORIES.includes(categoryKey)) {
      return this.prisma.schoolReviewData.findUnique({ where: { reviewId } });
    }
    if (MEDICAL_CATEGORIES.includes(categoryKey)) {
      return this.prisma.medicalReviewData.findUnique({ where: { reviewId } });
    }
    if (PRODUCT_CATEGORIES.includes(categoryKey)) {
      return this.prisma.productReviewData.findUnique({ where: { reviewId } });
    }
    return null;
  }

  // ─── School Profile Internals ─────────────────

  private async getSchoolProfile(entityId: string) {
    const profile = await this.prisma.schoolProfile.findUnique({ where: { entityId } });
    if (!profile) return null;
    return {
      ...profile,
      facilities: profile.facilitiesJson || [],
      branches: profile.branchesJson || [],
      type: 'school',
    };
  }

  private async createSchoolProfile(entityId: string, data: any) {
    const existing = await this.prisma.schoolProfile.findUnique({ where: { entityId } });
    if (existing) throw new ConflictException('School profile already exists');

    return this.prisma.schoolProfile.create({
      data: {
        entityId,
        description: data.description ? sanitizeInput(data.description) : null,
        logoUrl: data.logoUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        websiteUrl: data.websiteUrl || null,
        schoolType: data.schoolType || null,
        curriculum: data.curriculum || null,
        feeRangeMin: data.feeRangeMin || null,
        feeRangeMax: data.feeRangeMax || null,
        foundedYear: data.foundedYear || null,
        totalStudents: data.totalStudents || null,
        facilitiesJson: data.facilities || null,
        branchesJson: data.branches || null,
      },
    });
  }

  private async updateSchoolProfile(entityId: string, data: any) {
    const profile = await this.prisma.schoolProfile.findUnique({ where: { entityId } });
    if (!profile) throw new NotFoundException('School profile not found');

    return this.prisma.schoolProfile.update({
      where: { entityId },
      data: {
        ...(data.description !== undefined && { description: sanitizeInput(data.description) }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
        ...(data.schoolType !== undefined && { schoolType: data.schoolType }),
        ...(data.curriculum !== undefined && { curriculum: data.curriculum }),
        ...(data.feeRangeMin !== undefined && { feeRangeMin: data.feeRangeMin }),
        ...(data.feeRangeMax !== undefined && { feeRangeMax: data.feeRangeMax }),
        ...(data.foundedYear !== undefined && { foundedYear: data.foundedYear }),
        ...(data.totalStudents !== undefined && { totalStudents: data.totalStudents }),
        ...(data.facilities !== undefined && { facilitiesJson: data.facilities }),
        ...(data.branches !== undefined && { branchesJson: data.branches }),
      },
    });
  }

  // ─── Medical Profile Internals ────────────────

  private async getMedicalProfile(entityId: string) {
    const profile = await this.prisma.medicalProfile.findUnique({ where: { entityId } });
    if (!profile) return null;
    return {
      ...profile,
      timings: profile.timingsJson || {},
      services: profile.servicesJson || [],
      type: 'medical',
    };
  }

  private async createMedicalProfile(entityId: string, data: any) {
    const existing = await this.prisma.medicalProfile.findUnique({ where: { entityId } });
    if (existing) throw new ConflictException('Medical profile already exists');

    return this.prisma.medicalProfile.create({
      data: {
        entityId,
        description: data.description ? sanitizeInput(data.description) : null,
        logoUrl: data.logoUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        websiteUrl: data.websiteUrl || null,
        specialization: data.specialization ? sanitizeInput(data.specialization) : null,
        qualifications: data.qualifications ? sanitizeInput(data.qualifications) : null,
        experienceYears: data.experienceYears || null,
        hospitalAffiliation: data.hospitalAffiliation ? sanitizeInput(data.hospitalAffiliation) : null,
        consultationFee: data.consultationFee || null,
        pmdcNumber: data.pmdcNumber || null,
        timingsJson: data.timings || null,
        servicesJson: data.services || null,
      },
    });
  }

  private async updateMedicalProfile(entityId: string, data: any) {
    const profile = await this.prisma.medicalProfile.findUnique({ where: { entityId } });
    if (!profile) throw new NotFoundException('Medical profile not found');

    return this.prisma.medicalProfile.update({
      where: { entityId },
      data: {
        ...(data.description !== undefined && { description: sanitizeInput(data.description) }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
        ...(data.specialization !== undefined && { specialization: data.specialization ? sanitizeInput(data.specialization) : null }),
        ...(data.qualifications !== undefined && { qualifications: data.qualifications ? sanitizeInput(data.qualifications) : null }),
        ...(data.experienceYears !== undefined && { experienceYears: data.experienceYears }),
        ...(data.hospitalAffiliation !== undefined && { hospitalAffiliation: data.hospitalAffiliation ? sanitizeInput(data.hospitalAffiliation) : null }),
        ...(data.consultationFee !== undefined && { consultationFee: data.consultationFee }),
        ...(data.pmdcNumber !== undefined && { pmdcNumber: data.pmdcNumber }),
        ...(data.timings !== undefined && { timingsJson: data.timings }),
        ...(data.services !== undefined && { servicesJson: data.services }),
      },
    });
  }

  // ─── Product Profile Internals ────────────────

  private async getProductProfile(entityId: string) {
    const profile = await this.prisma.productProfile.findUnique({ where: { entityId } });
    if (!profile) return null;
    return {
      ...profile,
      variants: profile.variantsJson || [],
      nutrition: profile.nutritionJson || {},
      type: 'product',
    };
  }

  private async createProductProfile(entityId: string, data: any) {
    const existing = await this.prisma.productProfile.findUnique({ where: { entityId } });
    if (existing) throw new ConflictException('Product profile already exists');

    return this.prisma.productProfile.create({
      data: {
        entityId,
        description: data.description ? sanitizeInput(data.description) : null,
        brand: data.brand ? sanitizeInput(data.brand) : null,
        imageUrl: data.imageUrl || null,
        productCategory: data.productCategory ? sanitizeInput(data.productCategory) : null,
        barcode: data.barcode || null,
        variantsJson: data.variants || null,
        nutritionJson: data.nutrition || null,
      },
    });
  }

  private async updateProductProfile(entityId: string, data: any) {
    const profile = await this.prisma.productProfile.findUnique({ where: { entityId } });
    if (!profile) throw new NotFoundException('Product profile not found');

    return this.prisma.productProfile.update({
      where: { entityId },
      data: {
        ...(data.description !== undefined && { description: sanitizeInput(data.description) }),
        ...(data.brand !== undefined && { brand: data.brand ? sanitizeInput(data.brand) : null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.productCategory !== undefined && { productCategory: data.productCategory ? sanitizeInput(data.productCategory) : null }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.variants !== undefined && { variantsJson: data.variants }),
        ...(data.nutrition !== undefined && { nutritionJson: data.nutrition }),
      },
    });
  }

  // ─── Review Data Internals ────────────────────

  private async createWorkplaceReviewData(reviewId: string, data: any) {
    return this.prisma.workplaceReviewData.create({
      data: {
        reviewId,
        workCulture: data.workCulture || null,
        salaryFairness: data.salaryFairness || null,
        managementQuality: data.managementQuality || null,
        careerGrowth: data.careerGrowth || null,
        workLifeBalance: data.workLifeBalance || null,
        benefitsSatisfaction: data.benefitsSatisfaction || null,
        recommendScore: data.recommendScore || null,
        employmentStatus: data.employmentStatus || null,
        jobTitle: data.jobTitle ? sanitizeInput(data.jobTitle) : null,
        departmentName: data.departmentName ? sanitizeInput(data.departmentName) : null,
        yearsAtCompany: data.yearsAtCompany || null,
      },
    });
  }

  private async createSchoolReviewData(reviewId: string, data: any) {
    return this.prisma.schoolReviewData.create({
      data: {
        reviewId,
        teachingQuality: data.teachingQuality || null,
        discipline: data.discipline || null,
        environment: data.environment || null,
        administration: data.administration || null,
        extracurriculars: data.extracurriculars || null,
        safety: data.safety || null,
        reviewerType: data.reviewerType || null,
        gradeOrClass: data.gradeOrClass || null,
        branchName: data.branchName ? sanitizeInput(data.branchName) : null,
        yearsAttended: data.yearsAttended || null,
      },
    });
  }

  private async createMedicalReviewData(reviewId: string, data: any) {
    return this.prisma.medicalReviewData.create({
      data: {
        reviewId,
        treatmentEffectiveness: data.treatmentEffectiveness || null,
        diagnosisAccuracy: data.diagnosisAccuracy || null,
        doctorBehavior: data.doctorBehavior || null,
        waitTime: data.waitTime || null,
        staffBehavior: data.staffBehavior || null,
        cleanliness: data.cleanliness || null,
        costFairness: data.costFairness || null,
        conditionTreated: data.conditionTreated ? sanitizeInput(data.conditionTreated) : null,
        visitType: data.visitType || null,
        wouldRecommend: data.wouldRecommend ?? null,
      },
    });
  }

  private async createProductReviewData(reviewId: string, data: any) {
    return this.prisma.productReviewData.create({
      data: {
        reviewId,
        taste: data.taste || null,
        quality: data.quality || null,
        valueForMoney: data.valueForMoney || null,
        packaging: data.packaging || null,
        consistency: data.consistency || null,
        variant: data.variant ? sanitizeInput(data.variant) : null,
        imageUrl: data.imageUrl || null,
        purchasePlace: data.purchasePlace ? sanitizeInput(data.purchasePlace) : null,
      },
    });
  }

  // ─── Helpers ──────────────────────────────────

  private async getEntityWithCategory(entityId: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id: entityId, deletedAt: null },
      include: { category: { select: { key: true } } },
    });
    if (!entity) throw new NotFoundException('Entity not found');
    return entity;
  }

  private async verifyOwnership(entityId: string, userId: string) {
    const claim = await this.prisma.entityClaim.findFirst({
      where: { entityId, requesterUserId: userId, status: 'approved' },
    });
    if (!claim) throw new ForbiddenException('You must be the claimed owner of this entity');
  }

  // ─── Admin listing methods ────────────────────

  async listSchoolProfiles(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [profiles, total] = await Promise.all([
      this.prisma.schoolProfile.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { entity: { select: { id: true, displayName: true } } },
      }),
      this.prisma.schoolProfile.count(),
    ]);
    return new PaginatedResponse(profiles, total, page, pageSize);
  }

  async listMedicalProfiles(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [profiles, total] = await Promise.all([
      this.prisma.medicalProfile.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { entity: { select: { id: true, displayName: true } } },
      }),
      this.prisma.medicalProfile.count(),
    ]);
    return new PaginatedResponse(profiles, total, page, pageSize);
  }

  async listProductProfiles(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [profiles, total] = await Promise.all([
      this.prisma.productProfile.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { entity: { select: { id: true, displayName: true } } },
      }),
      this.prisma.productProfile.count(),
    ]);
    return new PaginatedResponse(profiles, total, page, pageSize);
  }
}
