const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const c = require("../controllers/projectController");

const router = express.Router();

router.get("/", c.getProjects);
router.get("/my", authMiddleware, c.getMyProjects); // must stay above "/:id"
router.get("/:id", c.getProject);
router.post("/", authMiddleware, c.createProject);
router.patch("/:id", authMiddleware, c.updateProject);
router.delete("/:id", authMiddleware, c.deleteProject);

module.exports = router;
