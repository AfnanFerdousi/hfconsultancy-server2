const express =require("express");
const router = express.Router();
// middlewares
const { requireSignin, isAdmin } =require("../middlewares/auth.js");

// controllers
const {
  create,
  list,
  read,
  photo,
  logo,
  remove,
  update,
  filteredSubjects,
  filteredSubjectsByStudyArea,
  filteredSubjectsByCountry,
  filteredSubjectsByProgramLevel,
  subjectsCount,
  listSubjects,
  subjectsSearch,
  relatedSubjects,
  searchFilters,
  searchByAllCondition,
  compareShortListedSubject
//   getToken,
//   processPayment,
//   orderStatus,
} =require("../controllers/subject");

// crud subjects
router.post("/subject", requireSignin, isAdmin, create);
router.get("/subjects", list);
router.get("/subject/:slug", read);
router.get("/subject/photo/:subjectId", photo);
router.get("/subject/logo/:subjectId", logo);
router.delete("/subject/:subjectId", requireSignin, isAdmin, remove);
router.put("/subject/:subjectId", requireSignin, isAdmin, update);

// querying subjects
// router.post("/filtered-subjects", filteredSubjects);
// router.post("/filtered-subjects-by-studyArea",filteredSubjectsByStudyArea);
// router.post("/filtered-subjects-by-country",filteredSubjectsByCountry);
// router.post("/filtered-subjects-by-programLevel",filteredSubjectsByProgramLevel);
router.get("/subjects/search/:keyword", subjectsSearch);
router.post("/related-subjects/:subjectId",relatedSubjects)
router.post("/filtered-subjects",searchFilters)
router.post("/subject/searchByAllCondition",searchByAllCondition)

// Subjects count as per query
router.get("/subjects-count", subjectsCount);
router.get("/list-subjects/:page", listSubjects);

router.post("/subjects/compare",compareShortListedSubject)

// router.get("/related-subjects/:subjectId/:studyAreaId", relatedSubjects);
// router.get("/braintree/token", getToken);
// router.post("/braintree/payment", requireSignin, processPayment);
// router.put("/order-status/:orderId", requireSignin, isAdmin, orderStatus);
module.exports= router;
