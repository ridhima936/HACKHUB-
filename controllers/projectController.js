const Project = require("../models/Project");
const { escapeRegex, isValidId, parseList } = require("../utils/helpers");

const STATUSES = ["Planning", "In Progress", "Completed"];

const validationResponse = (res, error) =>
    res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message)
    });

const getProjects = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};

        if (search) {
            const rx = new RegExp(escapeRegex(search), "i");
            filter.$or = [{ name: rx }, { description: rx }];
        }
        if (category) filter.category = String(category);

        const projects = await Project.find(filter)
            .populate("owner", "name")
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch projects" });
    }
};

const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ owner: req.user.userId })
            .populate("owner", "name")
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your projects" });
    }
};

const getProject = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid project id" });
        }
        const project = await Project.findById(req.params.id).populate("owner", "name");
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch project" });
    }
};

const createProject = async (req, res) => {
    try {
        const { name, description, category, status } = req.body || {};
        const project = await Project.create({
            name,
            description,
            category,
            techStack: parseList(req.body?.techStack),
            status: STATUSES.includes(status) ? status : undefined,
            owner: req.user.userId
        });
        res.status(201).json(project);
    } catch (error) {
        if (error.name === "ValidationError") return validationResponse(res, error);
        res.status(500).json({ message: "Failed to create project" });
    }
};

const updateProject = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid project id" });
        }
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not allowed to update this project" });
        }

        // Whitelist editable fields (prevents changing owner/rating via request body)
        const { name, description, category, status } = req.body || {};
        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (category !== undefined) project.category = category;
        if (status !== undefined && STATUSES.includes(status)) project.status = status;
        if (req.body?.techStack !== undefined) project.techStack = parseList(req.body.techStack);

        await project.save();
        await project.populate("owner", "name");
        res.json(project);
    } catch (error) {
        if (error.name === "ValidationError") return validationResponse(res, error);
        res.status(500).json({ message: "Failed to update project" });
    }
};

const deleteProject = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid project id" });
        }
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not allowed to delete this project" });
        }

        await project.deleteOne();
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete project" });
    }
};

module.exports = { getProjects, getMyProjects, getProject, createProject, updateProject, deleteProject };
