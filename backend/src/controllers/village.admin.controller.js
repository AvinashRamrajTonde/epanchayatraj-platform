import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { memberService } from '../services/member.service.js';
import { noticeService } from '../services/notice.service.js';
import { contentService } from '../services/content.service.js';
import { applicationService } from '../services/application.service.js';
import { galleryService } from '../services/gallery.service.js';
import { heroSlideService } from '../services/heroSlide.service.js';
import { programService } from '../services/program.service.js';
import { schemeService } from '../services/scheme.service.js';
import { contactSubmissionService } from '../services/contactSubmission.service.js';
import { awardService } from '../services/award.service.js';
import { financialReportService } from '../services/financialReport.service.js';
import { gramsabhaService } from '../services/gramsabha.service.js';
import { schoolService } from '../services/school.service.js';
import { developmentWorkService } from '../services/developmentWork.service.js';
import { complaintService } from '../services/complaint.service.js';
import { taxService } from '../services/tax.service.js';
import prisma from '../config/db.js';

// Helper to get village ID from authenticated admin user
function getVillageId(req) {
  if (!req.user?.villageId) {
    throw new ApiError(403, 'You are not associated with any village');
  }
  return req.user.villageId;
}

// ---- Dashboard ----
export const getDashboardStats = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);

  const [
    memberCount,
    noticeCount,
    applicationStats,
    galleryCount,
  ] = await Promise.all([
    prisma.member.count({ where: { villageId, isActive: true } }),
    prisma.notice.count({ where: { villageId } }),
    applicationService.getStats(villageId),
    prisma.galleryImage.count({ where: { villageId } }),
  ]);

  const village = await prisma.village.findUnique({
    where: { id: villageId },
    include: { tehsil: true },
  });

  sendResponse(res, 200, {
    village,
    stats: {
      members: memberCount,
      notices: noticeCount,
      applications: applicationStats,
      galleryImages: galleryCount,
    },
  }, 'Dashboard stats retrieved');
});

// ---- Members ----
export const getMembers = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const members = await memberService.findAll(villageId);
  sendResponse(res, 200, members, 'Members retrieved');
});

export const getMember = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const member = await memberService.findById(villageId, req.params.id);
  sendResponse(res, 200, member, 'Member retrieved');
});

export const createMember = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const member = await memberService.create(villageId, req.body);
  sendResponse(res, 201, member, 'Member created successfully');
});

export const updateMember = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const member = await memberService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, member, 'Member updated successfully');
});

export const deleteMember = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await memberService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Member deleted successfully');
});

// ---- Notices ----
export const getNotices = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await noticeService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Notices retrieved');
});

export const getNotice = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const notice = await noticeService.findById(villageId, req.params.id);
  sendResponse(res, 200, notice, 'Notice retrieved');
});

export const createNotice = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const notice = await noticeService.create(villageId, req.body);
  sendResponse(res, 201, notice, 'Notice created successfully');
});

export const updateNotice = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const notice = await noticeService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, notice, 'Notice updated successfully');
});

export const deleteNotice = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await noticeService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Notice deleted successfully');
});

// ---- Gallery ----
export const getGalleryImages = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const images = await galleryService.findAll(villageId);
  sendResponse(res, 200, images, 'Gallery images retrieved');
});

export const createGalleryImage = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const image = await galleryService.create(villageId, req.body);
  sendResponse(res, 201, image, 'Gallery image added successfully');
});

export const deleteGalleryImage = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await galleryService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Gallery image deleted successfully');
});

// ---- Content ----
export const getAllContent = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const contents = await contentService.findAll(villageId);
  sendResponse(res, 200, contents, 'Content retrieved');
});

export const getContent = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const content = await contentService.findBySection(villageId, req.params.section);
  sendResponse(res, 200, content, 'Content retrieved');
});

export const upsertContent = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const content = await contentService.upsert(villageId, req.params.section, req.body.content);
  sendResponse(res, 200, content, 'Content saved successfully');
});

// ---- Applications ----
export const getApplications = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await applicationService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Applications retrieved');
});

export const getApplication = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const application = await applicationService.findById(villageId, req.params.id);
  sendResponse(res, 200, application, 'Application retrieved');
});

export const updateApplicationStatus = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const application = await applicationService.updateStatus(
    villageId,
    req.params.id,
    req.body.status,
    req.body.remarks,
  );
  sendResponse(res, 200, application, 'Application status updated');
});

// ---- Village Settings ----
export const getVillageSettings = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const village = await prisma.village.findUnique({
    where: { id: villageId },
    select: { id: true, name: true, slug: true, subdomain: true, settings: true },
  });
  if (!village) throw new ApiError(404, 'Village not found');
  sendResponse(res, 200, village, 'Village settings retrieved');
});

export const updateVillageSettings = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const village = await prisma.village.update({
    where: { id: villageId },
    data: { settings: req.body.settings },
    select: { id: true, name: true, slug: true, subdomain: true, settings: true },
  });
  sendResponse(res, 200, village, 'Village settings updated');
});

// ---- Hero Slides ----
export const getHeroSlides = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const slides = await heroSlideService.findAll(villageId);
  sendResponse(res, 200, slides, 'Hero slides retrieved');
});

export const createHeroSlide = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const slide = await heroSlideService.create(villageId, req.body);
  sendResponse(res, 201, slide, 'Hero slide created successfully');
});

export const updateHeroSlide = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const slide = await heroSlideService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, slide, 'Hero slide updated successfully');
});

export const deleteHeroSlide = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await heroSlideService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Hero slide deleted successfully');
});

// ---- Programs ----
export const getPrograms = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await programService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Programs retrieved');
});

export const getProgram = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const program = await programService.findById(villageId, req.params.id);
  sendResponse(res, 200, program, 'Program retrieved');
});

export const createProgram = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const program = await programService.create(villageId, req.body);
  sendResponse(res, 201, program, 'Program created successfully');
});

export const updateProgram = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const program = await programService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, program, 'Program updated successfully');
});

export const deleteProgram = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await programService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Program deleted successfully');
});

// ---- Schemes ----
export const getSchemes = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await schemeService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Schemes retrieved');
});

export const getScheme = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const scheme = await schemeService.findById(villageId, req.params.id);
  sendResponse(res, 200, scheme, 'Scheme retrieved');
});

export const createScheme = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const scheme = await schemeService.create(villageId, req.body);
  sendResponse(res, 201, scheme, 'Scheme created successfully');
});

export const updateScheme = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const scheme = await schemeService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, scheme, 'Scheme updated successfully');
});

export const deleteScheme = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await schemeService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Scheme deleted successfully');
});

// ---- Contact Submissions ----
export const getContactSubmissions = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await contactSubmissionService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Contact submissions retrieved');
});

export const updateContactSubmissionStatus = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const submission = await contactSubmissionService.updateStatus(villageId, req.params.id, req.body.status);
  sendResponse(res, 200, submission, 'Contact submission status updated');
});

export const deleteContactSubmission = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await contactSubmissionService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Contact submission deleted');
});

// ---- Awards ----
export const getAwards = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await awardService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Awards retrieved');
});
export const getAward = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const award = await awardService.findById(villageId, req.params.id);
  sendResponse(res, 200, award, 'Award retrieved');
});
export const createAward = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const award = await awardService.create(villageId, req.body);
  sendResponse(res, 201, award, 'Award created successfully');
});
export const updateAward = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const award = await awardService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, award, 'Award updated successfully');
});
export const deleteAward = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await awardService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Award deleted successfully');
});

// ---- Financial Reports ----
export const getFinancialReports = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const reports = await financialReportService.findAll(villageId);
  sendResponse(res, 200, reports, 'Financial reports retrieved');
});
export const getFinancialReport = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const report = await financialReportService.findById(villageId, req.params.id);
  sendResponse(res, 200, report, 'Financial report retrieved');
});
export const createFinancialReport = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const report = await financialReportService.create(villageId, req.body);
  sendResponse(res, 201, report, 'Financial report created successfully');
});
export const updateFinancialReport = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const report = await financialReportService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, report, 'Financial report updated successfully');
});
export const deleteFinancialReport = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await financialReportService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Financial report deleted successfully');
});

// ---- Gramsabha ----
export const getGramsabhas = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await gramsabhaService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Gramsabhas retrieved');
});
export const getGramsabha = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const gramsabha = await gramsabhaService.findById(villageId, req.params.id);
  sendResponse(res, 200, gramsabha, 'Gramsabha retrieved');
});
export const createGramsabha = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const gramsabha = await gramsabhaService.create(villageId, req.body);
  sendResponse(res, 201, gramsabha, 'Gramsabha created successfully');
});
export const updateGramsabha = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const gramsabha = await gramsabhaService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, gramsabha, 'Gramsabha updated successfully');
});
export const deleteGramsabha = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await gramsabhaService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Gramsabha deleted successfully');
});

// ---- Schools ----
export const getSchools = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const schools = await schoolService.findAll(villageId);
  sendResponse(res, 200, { schools }, 'Schools retrieved');
});
export const getSchool = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const school = await schoolService.findById(villageId, req.params.id);
  sendResponse(res, 200, school, 'School retrieved');
});
export const createSchool = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const school = await schoolService.create(villageId, req.body);
  sendResponse(res, 201, school, 'School created successfully');
});
export const updateSchool = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const school = await schoolService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, school, 'School updated successfully');
});
export const deleteSchool = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await schoolService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'School deleted successfully');
});

// ---- Development Works ----
export const getDevelopmentWorks = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const works = await developmentWorkService.findAll(villageId, req.query);
  sendResponse(res, 200, works, 'Development works retrieved');
});
export const getDevelopmentWork = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const work = await developmentWorkService.findById(villageId, req.params.id);
  sendResponse(res, 200, work, 'Development work retrieved');
});
export const createDevelopmentWork = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const work = await developmentWorkService.create(villageId, req.body);
  sendResponse(res, 201, work, 'Development work created successfully');
});
export const updateDevelopmentWork = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const work = await developmentWorkService.update(villageId, req.params.id, req.body);
  sendResponse(res, 200, work, 'Development work updated successfully');
});
export const deleteDevelopmentWork = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await developmentWorkService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Development work deleted successfully');
});

// ---- Complaints ----
export const getComplaints = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await complaintService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Complaints retrieved');
});
export const getComplaint = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const complaint = await complaintService.findById(villageId, req.params.id);
  sendResponse(res, 200, complaint, 'Complaint retrieved');
});
export const updateComplaint = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const complaint = await complaintService.updateStatus(villageId, req.params.id, req.body);
  sendResponse(res, 200, complaint, 'Complaint updated');
});
export const deleteComplaint = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await complaintService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Complaint deleted');
});
export const getComplaintStats = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const stats = await complaintService.getStats(villageId);
  sendResponse(res, 200, stats, 'Complaint stats retrieved');
});

// ---- Tax Payments ----
export const getTaxPayments = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const result = await taxService.findAll(villageId, req.query);
  sendResponse(res, 200, result, 'Tax payments retrieved');
});
export const getTaxPayment = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const rec = await taxService.findById(villageId, req.params.id);
  sendResponse(res, 200, rec, 'Tax payment retrieved');
});
export const updateTaxPayment = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const rec = await taxService.updateStatus(villageId, req.params.id, req.body);
  sendResponse(res, 200, rec, 'Tax payment updated');
});
export const deleteTaxPayment = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  await taxService.remove(villageId, req.params.id);
  sendResponse(res, 200, null, 'Tax payment deleted');
});
export const getTaxStats = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const stats = await taxService.getStats(villageId, req.query);
  sendResponse(res, 200, stats, 'Tax stats retrieved');
});
export const getTaxYears = catchAsync(async (req, res) => {
  const villageId = getVillageId(req);
  const years = await taxService.getYears(villageId);
  sendResponse(res, 200, years, 'Tax years retrieved');
});
