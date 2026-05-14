// static/script.js
document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadProjects();
    loadSkills();
    setupContactForm();
    setupEditProfileForm();
    setupAddProjectForm();
    setupAddSkillForm();
});

// ===== IMAGE UPLOAD FUNCTIONS =====

function triggerImageUpload() {
    document.getElementById('avatarUploadInput').click();
}

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const base64Image = e.target.result;
            document.getElementById('aboutAvatar').src = base64Image;
            await updateProfileImage(base64Image);
        };
        reader.readAsDataURL(file);
    }
}

function handleModalImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            document.getElementById('modalAvatarPreview').src = base64Image;
            document.getElementById('editProfileAvatar').value = base64Image;
        };
        reader.readAsDataURL(file);
    }
}

async function updateProfileImage(base64Image) {
    try {
        const profileId = document.getElementById('profileId').value;
        const currentProfile = await fetch('/api/profile').then(r => r.json());
        
        const data = {
            id: profileId,
            name: currentProfile.name,
            title: currentProfile.title,
            bio: currentProfile.bio,
            email: currentProfile.email,
            phone: currentProfile.phone,
            location: currentProfile.location,
            avatar_url: base64Image,
            github_url: currentProfile.github_url,
            linkedin_url: currentProfile.linkedin_url,
            twitter_url: currentProfile.twitter_url,
            website_url: currentProfile.website_url,
            years_experience: currentProfile.years_experience,
            resume_url: currentProfile.resume_url,
            availability_status: currentProfile.availability_status
        };
        
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Profile image updated successfully!');
        }
    } catch (error) {
        console.error('Error updating profile image:', error);
    }
}

// ===== PROFILE FUNCTIONS =====
async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        const profile = await response.json();
        
        if (profile.id) {
            document.getElementById('aboutName').textContent = profile.name;
            document.getElementById('aboutTitle').textContent = profile.title;
            document.getElementById('aboutBio').textContent = profile.bio;
            document.getElementById('aboutEmail').textContent = profile.email;
            document.getElementById('aboutPhone').textContent = profile.phone;
            document.getElementById('aboutLocation').textContent = profile.location;
            document.getElementById('aboutAvatar').src = profile.avatar_url;
            document.getElementById('modalAvatarPreview').src = profile.avatar_url;
            document.getElementById('profileId').value = profile.id;
            
            const socialLinks = document.getElementById('socialLinks');
            socialLinks.innerHTML = '';
            
            const socials = [
                { url: profile.github_url, icon: 'GitHub', symbol: '🔗' },
                { url: profile.linkedin_url, icon: 'LinkedIn', symbol: '💼' },
                { url: profile.twitter_url, icon: 'Twitter', symbol: '𝕏' },
                { url: profile.website_url, icon: 'Website', symbol: '🌐' }
            ];
            
            socials.forEach(social => {
                if (social.url) {
                    socialLinks.innerHTML += `<a href="${social.url}" target="_blank" title="${social.icon}">${social.symbol}</a>`;
                }
            });
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function openEditProfileModal() {
    const profile = {
        id: document.getElementById('profileId').value,
        name: document.getElementById('aboutName').textContent,
        title: document.getElementById('aboutTitle').textContent,
        bio: document.getElementById('aboutBio').textContent,
        email: document.getElementById('aboutEmail').textContent,
        phone: document.getElementById('aboutPhone').textContent,
        location: document.getElementById('aboutLocation').textContent,
        avatar_url: document.getElementById('aboutAvatar').src
    };
    
    document.getElementById('editProfileName').value = profile.name;
    document.getElementById('editProfileTitle').value = profile.title;
    document.getElementById('editProfileBio').value = profile.bio;
    document.getElementById('editProfileEmail').value = profile.email;
    document.getElementById('editProfilePhone').value = profile.phone;
    document.getElementById('editProfileLocation').value = profile.location;
    document.getElementById('editProfileAvatar').value = profile.avatar_url;
    document.getElementById('profileId').value = profile.id;
    
    document.getElementById('editProfileModal').style.display = 'block';
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

function setupEditProfileForm() {
    document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        let avatarUrl = document.getElementById('editProfileAvatar').value;
        if (!avatarUrl) {
            avatarUrl = document.getElementById('modalAvatarPreview').src;
        }
        
        const data = {
            id: document.getElementById('profileId').value,
            name: document.getElementById('editProfileName').value,
            title: document.getElementById('editProfileTitle').value,
            bio: document.getElementById('editProfileBio').value,
            email: document.getElementById('editProfileEmail').value,
            phone: document.getElementById('editProfilePhone').value,
            location: document.getElementById('editProfileLocation').value,
            avatar_url: avatarUrl,
            github_url: document.getElementById('editProfileGithub').value,
            linkedin_url: document.getElementById('editProfileLinkedin').value,
            twitter_url: document.getElementById('editProfileTwitter').value,
            website_url: document.getElementById('editProfileWebsite').value,
            years_experience: document.getElementById('editProfileExperience').value,
            resume_url: document.getElementById('editProfileResume').value,
            availability_status: document.getElementById('editProfileAvailability').value
        };
        
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('Profile updated successfully!');
                loadProfile();
                closeEditProfileModal();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating profile');
        }
    });
}

// ===== PROJECT FUNCTIONS =====
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        const projectsGrid = document.getElementById('projectsGrid');
        
        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-card">
                ${project.image_url ? `<img src="${project.image_url}" alt="${project.title}">` : '<div style="width: 100%; height: 200px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>'}
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">
                    <strong>Tech:</strong> ${project.technologies}
                </div>
                <div class="project-links">
                    ${project.github_url ? `<a href="${project.github_url}" target="_blank">GitHub</a>` : ''}
                    ${project.demo_url ? `<a href="${project.demo_url}" target="_blank">Demo</a>` : ''}
                    <button class="delete" onclick="deleteProject(${project.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function openAddProjectModal() {
    document.getElementById('addProjectForm').reset();
    document.getElementById('addProjectModal').style.display = 'block';
}

function closeAddProjectModal() {
    document.getElementById('addProjectModal').style.display = 'none';
}

function setupAddProjectForm() {
    document.getElementById('addProjectForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const data = {
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            technologies: document.getElementById('projectTechnologies').value,
            image_url: document.getElementById('projectImage').value,
            github_url: document.getElementById('projectGithub').value,
            demo_url: document.getElementById('projectDemo').value
        };
        
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('Project added successfully!');
                this.reset();
                loadProjects();
                closeAddProjectModal();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding project');
        }
    });
}

async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Project deleted successfully!');
                loadProjects();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting project');
        }
    }
}

// ===== SKILLS FUNCTIONS =====
async function loadSkills() {
    try {
        const response = await fetch('/api/skills');
        const skills = await response.json();
        const skillsGrid = document.getElementById('skillsGrid');
        
        skillsGrid.innerHTML = skills.map(skill => `
            <div class="skill-card">
                <button class="skill-delete" type="button" onclick="deleteSkill(${skill.id})">×</button>
                <h3>${skill.name}</h3>
                <div class="skill-category">${skill.category}</div>
                <div class="skill-bar">
                    <div class="skill-fill" style="width: ${getProficiencyPercentage(skill.proficiency)}%"></div>
                </div>
                <small>${skill.proficiency}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

function openAddSkillModal() {
    document.getElementById('addSkillForm').reset();
    document.getElementById('addSkillModal').style.display = 'block';
}

function closeAddSkillModal() {
    document.getElementById('addSkillModal').style.display = 'none';
}

function setupAddSkillForm() {
    document.getElementById('addSkillForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('skillName').value,
            category: document.getElementById('skillCategory').value,
            proficiency: document.getElementById('skillProficiency').value
        };
        
        try {
            const response = await fetch('/api/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('Skill added successfully!');
                this.reset();
                loadSkills();
                closeAddSkillModal();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding skill');
        }
    });
}

async function deleteSkill(id) {
    if (confirm('Are you sure you want to delete this skill?')) {
        try {
            const response = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Skill deleted successfully!');
                loadSkills();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting skill');
        }
    }
}

// ===== CONTACT FORM =====
function setupContactForm() {
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                alert('Message sent successfully!');
                form.reset();
            } else {
                alert('Error sending message. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending message. Please try again.');
        }
    });
}

// ===== HELPER FUNCTIONS =====
function getProficiencyPercentage(proficiency) {
    const levels = {
        'Beginner': 33,
        'Intermediate': 66,
        'Advanced': 85,
        'Expert': 100
    };
    return levels[proficiency] || 50;
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});