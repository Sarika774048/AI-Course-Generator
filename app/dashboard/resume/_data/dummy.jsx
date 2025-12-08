export default {
    firstName: 'James',
    lastName: 'Carter',
    jobTitle: 'Full Stack Developer',
    address: '525 N Tryon Street, NC 28117',
    phone: '+1 234 567 890',
    email: 'james@example.com',
    themeColor: "#7c3aed",
    // 👇 NEW FIELDS ADDED HERE
    github: 'github.com/jamescarter',
    linkedin: 'linkedin.com/in/jamescarter',
    website: 'jamescarter.dev',
    // -------------------------
    summary: 'Driven and dedicated Full Stack Developer with 5+ years of experience...',
    experience: [
        {
            id: 1,
            title: 'Software Engineer',
            companyName: 'Tech Solutions Inc.',
            city: 'New York',
            state: 'NY',
            startDate: 'Jan 2021',
            endDate: 'Present',
            currentlyWorking: true,
            workSummary: 'Designed and developed user-friendly web interfaces using React.js.'
        }
    ],
    education: [
        {
            id: 1,
            universityName: 'Western Illinois University',
            startDate: 'Aug 2018',
            endDate: 'Dec 2022',
            degree: 'Bachelor of Science',
            major: 'Computer Science',
            description: 'Graduated with Honors.'
        }
    ],
    skills: [
        { id: 1, name: 'React', rating: 100 },
        { id: 2, name: 'Next.js', rating: 80 }
    ]
}