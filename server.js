const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/admissionPortal', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Student Schema
const studentSchema = new mongoose.Schema({
    // Login/Signup fields
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    
    // Profile fields
    dob: Date,
    gender: String,
    nationality: String,
    address: String,
    contactNumber: String,
    
    // Application details
    appliedUniversity: String,
    appliedCampus: String,
    appliedProgram: String,
    
    // Academic history
    matricBoard: String,
    matricYear: Number,
    matricMarks: String,
    matricSubjects: [String],
    
    interBoard: String,
    interYear: Number,
    interMarks: String,
    interSubjects: [String],
    
    bachelorUni: String,
    bachelorYear: Number,
    bachelorMarks: String,
    bachelorMajor: [String],
    
    masterUni: String,
    masterYear: Number,
    masterMarks: String,
    masterMajor: [String],
    
    // Document paths (we'll store paths to uploaded files)
    idDocumentPath: String,
    matricTranscriptPath: String,
    interTranscriptPath: String,
    bachelorTranscriptPath: String,
    masterTranscriptPath: String,
    
    createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// University Schema
const universitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    website: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const University = mongoose.model('University', universitySchema);

// Campus Schema
const campusSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Department Schema
const departmentSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    name: { type: String, required: true },
    campus: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

// Faculty Schema
const facultySchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    campus: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Program Schema
const programSchema = new mongoose.Schema({
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    title: { type: String, required: true },
    campus: { type: String, required: true },
    department: { type: String, required: true },
    duration: { type: String, required: true },
    fees: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const Campus = mongoose.model('Campus', campusSchema);
const Department = mongoose.model('Department', departmentSchema);
const Faculty = mongoose.model('Faculty', facultySchema);
const Program = mongoose.model('Program', programSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Routes


// Student Signup
app.post('/api/students/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        
        const student = new Student({
            fullName: name,
            email,
            password
        });
        
        await student.save();
        
        res.json({ message: 'Signup successful', studentId: student._id });
    } catch (err) {
        console.error('Student signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Student Login
app.post('/api/students/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const student = await Student.findOne({ email });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        if (student.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        res.json({ 
            message: 'Login successful',
            studentId: student._id,
            fullName: student.fullName
        });
    } catch (err) {
        console.error('Student login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// University Registration
app.post('/api/universities/register', async (req, res) => {
    try {
        const { name, contactPerson, email, password, address, website, description } = req.body;
        
        if (!name || !contactPerson || !email || !password || !address) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        
        const existingUniversity = await University.findOne({ email });
        if (existingUniversity) {
            return res.status(400).json({ error: 'University with this email already exists' });
        }
        
        const university = new University({
            name,
            contactPerson,
            email,
            password,
            address,
            website,
            description
        });
        
        await university.save();
        
        res.json({ 
            message: 'University registration successful',
            universityId: university._id
        });
    } catch (err) {
        console.error('University registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get University Profile
app.get('/api/universities/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const university = await University.findById(req.params.id);
        if (!university) {
            return res.status(404).json({ error: 'University not found' });
        }
        
        // Return only necessary fields (exclude password)
        const { _id, name, contactPerson, email, address, website, description, createdAt } = university;
        res.json({
            _id, name, contactPerson, email, address, website, description, createdAt
        });
    } catch (err) {
        console.error('Get university error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// University Login
app.post('/api/universities/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const university = await University.findOne({ email });
        if (!university) {
            return res.status(404).json({ error: 'University not found' });
        }
        
        if (university.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        res.json({ 
            message: 'Login successful',
            universityId: university._id,
            name: university.name
        });
    } catch (err) {
        console.error('University login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get University Profile
app.get('/api/universities/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const university = await University.findById(req.params.id);
        if (!university) {
            return res.status(404).json({ error: 'University not found' });
        }
        
        res.json(university);
    } catch (err) {
        console.error('Get university error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Campus Routes

// Add new campus
app.post('/api/universities/campuses', async (req, res) => {
    try {
        const { universityId, name, address, contact } = req.body;
        
        if (!universityId || !name || !address || !contact) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(universityId)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const university = await University.findById(universityId);
        if (!university) {
            return res.status(404).json({ error: 'University not found' });
        }
        
        const campus = new Campus({
            universityId,
            name,
            address,
            contact
        });
        
        await campus.save();
        
        res.status(201).json({ 
            message: 'Campus added successfully',
            campus
        });
    } catch (err) {
        console.error('Add campus error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all campuses for a university
app.get('/api/universities/:id/campuses', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const campuses = await Campus.find({ universityId: req.params.id });
        res.json(campuses);
    } catch (err) {
        console.error('Get campuses error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single campus
app.get('/api/universities/campuses/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid campus ID' });
        }
        
        const campus = await Campus.findById(req.params.id);
        if (!campus) {
            return res.status(404).json({ error: 'Campus not found' });
        }
        
        res.json(campus);
    } catch (err) {
        console.error('Get campus error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update campus
app.put('/api/universities/campuses/:id', async (req, res) => {
    try {
        const { name, address, contact } = req.body;
        
        if (!name || !address || !contact) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid campus ID' });
        }
        
        const updatedCampus = await Campus.findByIdAndUpdate(
            req.params.id,
            { name, address, contact },
            { new: true }
        );
        
        if (!updatedCampus) {
            return res.status(404).json({ error: 'Campus not found' });
        }
        
        res.json({ 
            message: 'Campus updated successfully',
            campus: updatedCampus
        });
    } catch (err) {
        console.error('Update campus error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete campus
app.delete('/api/universities/campuses/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid campus ID' });
        }
        
        const deletedCampus = await Campus.findByIdAndDelete(req.params.id);
        if (!deletedCampus) {
            return res.status(404).json({ error: 'Campus not found' });
        }
        
        res.json({ 
            message: 'Campus deleted successfully',
            campus: deletedCampus
        });
    } catch (err) {
        console.error('Delete campus error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Department Routes

// Add new department
app.post('/api/universities/departments', async (req, res) => {
    try {
        const { universityId, name, campus, description } = req.body;
        
        if (!universityId || !name || !campus) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(universityId)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const department = new Department({
            universityId,
            name,
            campus,
            description
        });
        
        await department.save();
        
        res.status(201).json({ 
            message: 'Department added successfully',
            department
        });
    } catch (err) {
        console.error('Add department error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all departments for a university
app.get('/api/universities/:id/departments', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const departments = await Department.find({ universityId: req.params.id });
        res.json(departments);
    } catch (err) {
        console.error('Get departments error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get single department
app.get('/api/universities/departments/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid department ID' });
        }
        
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        res.json(department);
    } catch (err) {
        console.error('Get department error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update department
app.put('/api/universities/departments/:id', async (req, res) => {
    try {
        const { name, campus, description } = req.body;
        
        if (!name || !campus) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid department ID' });
        }
        
        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id,
            { name, campus, description },
            { new: true }
        );
        
        if (!updatedDepartment) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        res.json({ 
            message: 'Department updated successfully',
            department: updatedDepartment
        });
    } catch (err) {
        console.error('Update department error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete department
app.delete('/api/universities/departments/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid department ID' });
        }
        
        const deletedDepartment = await Department.findByIdAndDelete(req.params.id);
        if (!deletedDepartment) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        res.json({ 
            message: 'Department deleted successfully',
            department: deletedDepartment
        });
    } catch (err) {
        console.error('Delete department error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Faculty Routes

// Add new faculty member
app.post('/api/universities/faculty', async (req, res) => {
    try {
        const { universityId, name, designation, campus, department, email } = req.body;
        
        if (!universityId || !name || !designation || !campus || !department || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(universityId)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const faculty = new Faculty({
            universityId,
            name,
            designation,
            campus,
            department,
            email
        });
        
        await faculty.save();
        
        res.status(201).json({ 
            message: 'Faculty member added successfully',
            faculty
        });
    } catch (err) {
        console.error('Add faculty error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all faculty for a university
app.get('/api/universities/:id/faculty', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const faculty = await Faculty.find({ universityId: req.params.id });
        res.json(faculty);
    } catch (err) {
        console.error('Get faculty error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single faculty member
app.get('/api/universities/faculty/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid faculty ID' });
        }
        
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty member not found' });
        }
        
        res.json(faculty);
    } catch (err) {
        console.error('Get faculty error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update faculty member
app.put('/api/universities/faculty/:id', async (req, res) => {
    try {
        const { name, designation, campus, department, email } = req.body;
        
        if (!name || !designation || !campus || !department || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid faculty ID' });
        }
        
        const updatedFaculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            { name, designation, campus, department, email },
            { new: true }
        );
        
        if (!updatedFaculty) {
            return res.status(404).json({ error: 'Faculty member not found' });
        }
        
        res.json({ 
            message: 'Faculty member updated successfully',
            faculty: updatedFaculty
        });
    } catch (err) {
        console.error('Update faculty error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete faculty member
app.delete('/api/universities/faculty/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid faculty ID' });
        }
        
        const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!deletedFaculty) {
            return res.status(404).json({ error: 'Faculty member not found' });
        }
        
        res.json({ 
            message: 'Faculty member deleted successfully',
            faculty: deletedFaculty
        });
    } catch (err) {
        console.error('Delete faculty error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// Program Routes

// Add new program
app.post('/api/universities/programs', async (req, res) => {
    try {
        const { universityId, title, campus, department, duration, fees, description } = req.body;
        
        if (!universityId || !title || !campus || !department || !duration || !fees) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(universityId)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const program = new Program({
            universityId,
            title,
            campus,
            department,
            duration,
            fees,
            description
        });
        
        await program.save();
        
        res.status(201).json({ 
            message: 'Program added successfully',
            program
        });
    } catch (err) {
        console.error('Add program error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all programs for a university
app.get('/api/universities/:id/programs', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const programs = await Program.find({ universityId: req.params.id });
        res.json(programs);
    } catch (err) {
        console.error('Get programs error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get single program
app.get('/api/universities/programs/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid program ID' });
        }
        
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }
        
        res.json(program);
    } catch (err) {
        console.error('Get program error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update program
app.put('/api/universities/programs/:id', async (req, res) => {
    try {
        const { title, campus, department, duration, fees, description } = req.body;
        
        if (!title || !campus || !department || !duration || !fees) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid program ID' });
        }
        
        const updatedProgram = await Program.findByIdAndUpdate(
            req.params.id,
            { title, campus, department, duration, fees, description },
            { new: true }
        );
        
        if (!updatedProgram) {
            return res.status(404).json({ error: 'Program not found' });
        }
        
        res.json({ 
            message: 'Program updated successfully',
            program: updatedProgram
        });
    } catch (err) {
        console.error('Update program error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete program
app.delete('/api/universities/programs/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid program ID' });
        }
        
        const deletedProgram = await Program.findByIdAndDelete(req.params.id);
        if (!deletedProgram) {
            return res.status(404).json({ error: 'Program not found' });
        }
        
        res.json({ 
            message: 'Program deleted successfully',
            program: deletedProgram
        });
    } catch (err) {
        console.error('Delete program error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get dashboard stats
app.get('/api/universities/:id/stats', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid university ID' });
        }
        
        const [campuses, programs] = await Promise.all([
            Campus.countDocuments({ universityId: req.params.id }),
            Program.countDocuments({ universityId: req.params.id })
        ]);
        
        res.json({
            campuses,
            programs,
            applicants: 0 // You'll need to implement this separately
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Update Student Profile
app.post('/api/students/updateProfile', upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'matricTranscript', maxCount: 1 },
    { name: 'interTranscript', maxCount: 1 },
    { name: 'bachelorTranscript', maxCount: 1 },
    { name: 'masterTranscript', maxCount: 1 }
]), async (req, res) => {
    try {
        const { studentId, ...profileData } = req.body;
        const files = req.files;
        
        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }
        
        // Prepare update data
        const updateData = {
            dob: profileData.dob,
            gender: profileData.gender,
            nationality: profileData.nationality,
            address: profileData.address,
            contactNumber: profileData.contactNumber,
            appliedUniversity: profileData.appliedUniversity,
            appliedCampus: profileData.appliedCampus,
            appliedProgram: profileData.appliedProgram,
            matricBoard: profileData.matricBoard,
            matricYear: profileData.matricYear,
            matricMarks: profileData.matricMarks,
            interBoard: profileData.interBoard,
            interYear: profileData.interYear,
            interMarks: profileData.interMarks,
            bachelorUni: profileData.bachelorUni,
            bachelorYear: profileData.bachelorYear,
            bachelorMarks: profileData.bachelorMarks,
            masterUni: profileData.masterUni,
            masterYear: profileData.masterYear,
            masterMarks: profileData.masterMarks
        };
        
        // Handle array fields
        if (profileData.matricSubjects) {
            updateData.matricSubjects = profileData.matricSubjects.split(',').map(s => s.trim());
        }
        if (profileData.interSubjects) {
            updateData.interSubjects = profileData.interSubjects.split(',').map(s => s.trim());
        }
        if (profileData.bachelorMajor) {
            updateData.bachelorMajor = profileData.bachelorMajor.split(',').map(s => s.trim());
        }
        if (profileData.masterMajor) {
            updateData.masterMajor = profileData.masterMajor.split(',').map(s => s.trim());
        }
        
        // Handle file uploads
        if (files.idDocument) {
            updateData.idDocumentPath = files.idDocument[0].path.replace('public/', '');
        }
        if (files.matricTranscript) {
            updateData.matricTranscriptPath = files.matricTranscript[0].path.replace('public/', '');
        }
        if (files.interTranscript) {
            updateData.interTranscriptPath = files.interTranscript[0].path.replace('public/', '');
        }
        if (files.bachelorTranscript) {
            updateData.bachelorTranscriptPath = files.bachelorTranscript[0].path.replace('public/', '');
        }
        if (files.masterTranscript) {
            updateData.masterTranscriptPath = files.masterTranscript[0].path.replace('public/', '');
        }
        
        // Update the student document
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!updatedStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json({ 
            message: 'Profile saved successfully',
            student: updatedStudent
        });
    } catch (err) {
        console.error('Save profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Student Profile
app.get('/api/students/profile/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }
        
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json(student);
    } catch (err) {
        console.error('Get student profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get student profile
app.get('/api/students/profile/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid student ID' });
        }
        
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json(student);
    } catch (err) {
        console.error('Get student profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add this to your server.js routes
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (err) {
        console.error('Get all students error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add this to your server.js routes
app.get('/api/universities', async (req, res) => {
    try {
        const universities = await University.find({});
        res.json(universities);
    } catch (err) {
        console.error('Get all universities error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Admin Routes

// Admin model (add this near your other models)
const Admin = mongoose.model('Admin', new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}));

// Admin Signup
app.post('/api/admins/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        
        const admin = new Admin({
            fullName: name,
            email,
            password
        });
        
        await admin.save();
        
        res.json({ message: 'Admin signup successful', adminId: admin._id });
    } catch (err) {
        console.error('Admin signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Login
app.post('/api/admins/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        if (admin.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        res.json({ 
            message: 'Login successful',
            adminId: admin._id,
            fullName: admin.fullName
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new admin
app.post('/api/admins', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const admin = new Admin({
            name,
            description
        });
        
        await admin.save();
        
        res.status(201).json({ 
            message: 'Admin added successfully',
            admin
        });
    } catch (err) {
        console.error('Add admin error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all admins
app.get('/api/admins', async (req, res) => {
    try {
        const admins = await Admin.find().sort({ createdAt: -1 });
        res.json(admins);
    } catch (err) {
        console.error('Get admins error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single admin
app.get('/api/admins/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid admin ID' });
        }
        
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        res.json(admin);
    } catch (err) {
        console.error('Get admin error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update admin
app.put('/api/admins/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid admin ID' });
        }
        
        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        
        if (!updatedAdmin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        res.json({ 
            message: 'Admin updated successfully',
            admin: updatedAdmin
        });
    } catch (err) {
        console.error('Update admin error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete admin
app.delete('/api/admins/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid admin ID' });
        }
        
        const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
        if (!deletedAdmin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        res.json({ 
            message: 'Admin deleted successfully',
            admin: deletedAdmin
        });
    } catch (err) {
        console.error('Delete admin error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});







// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});