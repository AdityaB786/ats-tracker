import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Job from '../models/Job';
import Application from '../models/Application';
import { ApplicationStatus } from '../types';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create demo users
    const recruiter = new User({
      name: 'Priya Sharma',
      email: 'recruiter@test.com',
      passwordHash: '123456', // Will be hashed by pre-save hook
      role: 'recruiter'
    });

    const applicant = new User({
      name: 'Arjun Patel',
      email: 'applicant@test.com',
      passwordHash: '123456',
      role: 'applicant'
    });

    const applicant2 = new User({
      name: 'Ananya Reddy',
      email: 'ananya.reddy@email.com',
      passwordHash: '123456',
      role: 'applicant'
    });

    const applicant3 = new User({
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      passwordHash: '123456',
      role: 'applicant'
    });

    const applicant4 = new User({
      name: 'Neha Gupta',
      email: 'neha.gupta@email.com',
      passwordHash: '123456',
      role: 'applicant'
    });

    await Promise.all([recruiter.save(), applicant.save(), applicant2.save(), applicant3.save(), applicant4.save()]);
    console.log('Created demo users');

    // Create demo jobs
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 45);

    // Priya's jobs
    const softwareEngineerJob = new Job({
      title: 'Senior Software Engineer - Full Stack',
      description: 'We are seeking an experienced Senior Software Engineer to join our dynamic team at InfoTech Solutions. You will be responsible for developing scalable web applications, mentoring junior developers, and contributing to architectural decisions. This role offers excellent growth opportunities and the chance to work on cutting-edge technologies.',
      requirements: '• 5+ years of experience in software development\n• Strong proficiency in JavaScript, React.js, Node.js, and MongoDB\n• Experience with cloud platforms (AWS/Azure)\n• Excellent problem-solving and communication skills\n• B.Tech/M.Tech in Computer Science or related field',
      location: 'Bangalore, Karnataka',
      deadline: futureDate,
      recruiterId: recruiter._id
    });

    const dataScientistJob = new Job({
      title: 'Data Scientist - Machine Learning',
      description: 'Join our AI/ML team at DataMinds Analytics to work on exciting machine learning projects. You will analyze large datasets, build predictive models, and deploy ML solutions that drive business decisions. We offer a collaborative environment and opportunities to work with the latest ML frameworks.',
      requirements: '• 3-5 years of experience in data science/ML\n• Proficiency in Python, R, TensorFlow/PyTorch\n• Strong knowledge of statistical analysis and ML algorithms\n• Experience with big data tools (Spark, Hadoop)\n• Masters/PhD in Statistics, Mathematics, or Computer Science preferred',
      location: 'Hyderabad, Telangana',
      deadline: futureDate,
      recruiterId: recruiter._id
    });

    const productManagerJob = new Job({
      title: 'Product Manager - FinTech',
      description: 'We are looking for a strategic Product Manager to lead our digital payment products at PaySecure. You will work closely with engineering, design, and business teams to deliver innovative financial solutions. This role requires a blend of technical knowledge and business acumen.',
      requirements: '• 4-6 years of product management experience\n• Experience in FinTech/payments industry preferred\n• Strong analytical and data-driven decision making skills\n• Excellent stakeholder management abilities\n• MBA from premier institute is a plus',
      location: 'Mumbai, Maharashtra',
      deadline: futureDate2,
      recruiterId: recruiter._id
    });

    // Additional jobs by Priya
    const devOpsEngineerJob = new Job({
      title: 'DevOps Engineer - Cloud Infrastructure',
      description: 'TechCorp is seeking a skilled DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. You will automate deployment processes, ensure system reliability, and implement security best practices. Join us to work on large-scale distributed systems.',
      requirements: '• 3-5 years of DevOps experience\n• Expertise in Docker, Kubernetes, Jenkins\n• Strong knowledge of AWS/Azure services\n• Experience with Infrastructure as Code (Terraform/Ansible)\n• Linux administration skills',
      location: 'Pune, Maharashtra',
      deadline: futureDate,
      recruiterId: recruiter._id
    });

    const uiuxDesignerJob = new Job({
      title: 'Senior UI/UX Designer',
      description: 'Create exceptional user experiences for our B2B SaaS products at DesignHub. You will conduct user research, create wireframes and prototypes, and collaborate with product teams to deliver intuitive designs. We value creativity and user-centered design thinking.',
      requirements: '• 5+ years of UI/UX design experience\n• Proficiency in Figma, Sketch, Adobe XD\n• Strong portfolio demonstrating B2B/SaaS design work\n• Understanding of design systems and accessibility standards\n• Experience with user research and usability testing',
      location: 'Gurgaon, Haryana',
      deadline: futureDate2,
      recruiterId: recruiter._id
    });

    const businessAnalystJob = new Job({
      title: 'Business Analyst - E-commerce',
      description: 'Join our e-commerce team to analyze business processes and drive data-driven decisions. You will work with stakeholders to gather requirements, create detailed documentation, and support the implementation of business solutions. Experience in e-commerce domain is highly valued.',
      requirements: '• 2-4 years of business analysis experience\n• Strong analytical and problem-solving skills\n• Proficiency in SQL, Excel, and data visualization tools\n• Experience with Agile methodologies\n• Excellent communication and documentation skills',
      location: 'Chennai, Tamil Nadu',
      deadline: futureDate,
      recruiterId: recruiter._id
    });

    await Promise.all([
      softwareEngineerJob.save(),
      dataScientistJob.save(),
      productManagerJob.save(),
      devOpsEngineerJob.save(),
      uiuxDesignerJob.save(),
      businessAnalystJob.save()
    ]);
    console.log('Created demo jobs');

    // Create demo applications with various statuses
    // Generate base64 encoded sample resume data (simulating PDF content)
    const sampleResumeData = 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA0OCBUZCA1MCA3MDAgVGQgKFNhbXBsZSBSZXN1bWUpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDE2MSAwMDAwMCBuIAowMDAwMDAwMjYzIDAwMDAwIG4gCjAwMDAwMDAzNDEgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MzQKJSVFT0YK';

    const applications = [
      // Software Engineer applications
      {
        jobId: softwareEngineerJob._id,
        applicantId: applicant._id,
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        applicantPhone: '+91 98765 43210',
        yearsOfExperience: 6,
        currentRole: 'Full Stack Developer',
        status: 'INTERVIEW' as ApplicationStatus,
        resumeData: sampleResumeData,
        resumeFileName: 'arjun_patel_resume.pdf',
        coverLetter: 'I am excited to apply for the Senior Software Engineer position at InfoTech Solutions. With 6 years of experience in full-stack development and expertise in React, Node.js, and cloud technologies, I believe I would be a valuable addition to your team. I have led multiple projects from conception to deployment and mentored junior developers.',
        notes: 'Strong technical skills, good communication, scheduled for technical round'
      },
      {
        jobId: softwareEngineerJob._id,
        applicantId: applicant2._id,
        applicantName: applicant2.name,
        applicantEmail: applicant2.email,
        applicantPhone: '+91 87654 32109',
        yearsOfExperience: 7,
        currentRole: 'Senior Software Engineer',
        status: 'OFFER' as ApplicationStatus,
        resumeData: sampleResumeData,
        resumeFileName: 'ananya_reddy_resume.pdf',
        coverLetter: 'With 7 years of experience in developing scalable web applications and a proven track record of delivering high-quality software solutions, I am eager to contribute to your team. My expertise in microservices architecture and cloud deployment aligns perfectly with your requirements.',
        notes: 'Excellent candidate, cleared all rounds, offer extended'
      },
      {
        jobId: softwareEngineerJob._id,
        applicantId: applicant3._id,
        applicantName: applicant3.name,
        applicantEmail: applicant3.email,
        applicantPhone: '+91 76543 21098',
        yearsOfExperience: 4,
        currentRole: 'Software Developer',
        status: 'UNDER_REVIEW' as ApplicationStatus,
        resumeData: sampleResumeData,
        resumeFileName: 'vikram_singh_resume.pdf',
        coverLetter: 'I am a passionate software developer with 4 years of experience in web development. While I may not meet the exact years of experience requirement, my strong technical skills and eagerness to learn make me a suitable candidate for this role.'
      },
      // Data Scientist applications
      {
        jobId: dataScientistJob._id,
        applicantId: applicant4._id,
        applicantName: applicant4.name,
        applicantEmail: applicant4.email,
        applicantPhone: '+91 96543 87210',
        yearsOfExperience: 4,
        currentRole: 'Data Analyst',
        status: 'INTERVIEW' as ApplicationStatus,
        resumeData: sampleResumeData,
        resumeFileName: 'neha_gupta_resume.pdf',
        coverLetter: 'As a Data Analyst with 4 years of experience and a strong foundation in machine learning, I am excited about the opportunity to transition into a Data Scientist role. I have completed several ML projects and certifications in deep learning.',
        notes: 'Good analytical skills, scheduled for technical discussion'
      },
      {
        jobId: dataScientistJob._id,
        applicantId: applicant._id,
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        applicantPhone: '+91 98765 43210',
        yearsOfExperience: 6,
        currentRole: 'Full Stack Developer',
        status: 'REJECTED' as ApplicationStatus,
        resumeData: sampleResumeData,
        resumeFileName: 'arjun_patel_resume.pdf',
        notes: 'Strong technical background but lacks ML/data science experience'
      },
      // Product Manager applications
      {
        jobId: productManagerJob._id,
        applicantId: applicant2._id,
        applicantName: applicant2.name,
        applicantEmail: applicant2.email,
        applicantPhone: '+91 87654 32109',
        yearsOfExperience: 7,
        currentRole: 'Senior Software Engineer',
        status: 'APPLIED' as ApplicationStatus,
        resumeData: sampleResumeData,
        resumeFileName: 'ananya_reddy_resume.pdf',
        coverLetter: 'I am interested in transitioning from a technical role to product management. My experience in software development gives me a unique perspective on product development, and I have been actively involved in product decisions in my current role.'
      },
      // DevOps Engineer applications
      {
        jobId: devOpsEngineerJob._id,
        applicantId: applicant3._id,
        applicantName: applicant3.name,
        applicantEmail: applicant3.email,
        applicantPhone: '+91 76543 21098',
        yearsOfExperience: 4,
        currentRole: 'Software Developer',
        status: 'UNDER_REVIEW' as ApplicationStatus,
        resumeData: sampleResumeData,
        resumeFileName: 'vikram_singh_resume.pdf',
        coverLetter: 'I have been working as a Software Developer with significant exposure to DevOps practices. I have implemented CI/CD pipelines and worked extensively with Docker and AWS in my current role.'
      },
      // UI/UX Designer applications
      {
        jobId: uiuxDesignerJob._id,
        applicantId: applicant4._id,
        applicantName: applicant4.name,
        applicantEmail: applicant4.email,
        applicantPhone: '+91 96543 87210',
        yearsOfExperience: 4,
        currentRole: 'Data Analyst',
        status: 'APPLIED' as ApplicationStatus,
        resumeData: sampleResumeData,
        resumeFileName: 'neha_gupta_resume.pdf'
      }
    ];

    await Application.insertMany(applications);
    console.log('Created demo applications');

    console.log('\nSeed completed successfully!');
    console.log('\nDemo accounts:');
    console.log('Recruiter: recruiter@test.com / 123456');
    console.log('Applicant: applicant@test.com / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();