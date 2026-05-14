from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
import os
import traceback

app = Flask(__name__)
DATABASE = 'portfolio.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    try:
        if not os.path.exists(DATABASE):
            conn = get_db()
            cursor = conn.cursor()
            
            # Create profile table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS profile (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    title TEXT NOT NULL,
                    bio TEXT NOT NULL,
                    email TEXT,
                    phone TEXT,
                    location TEXT,
                    avatar_url TEXT,
                    github_url TEXT,
                    linkedin_url TEXT,
                    twitter_url TEXT,
                    website_url TEXT,
                    years_experience INTEGER,
                    resume_url TEXT,
                    availability_status TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create projects table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    technologies TEXT NOT NULL,
                    image_url TEXT,
                    github_url TEXT,
                    demo_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create skills table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    proficiency TEXT NOT NULL,
                    category TEXT NOT NULL
                )
            ''')
            
            # Create contact table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS contact (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Insert sample profile data
            cursor.execute('''
                INSERT INTO profile (name, title, bio, email, phone, location, avatar_url, 
                                    github_url, linkedin_url, twitter_url, website_url, 
                                    years_experience, availability_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', ('Your Name', 'Full Stack Developer', 
                  'I am a passionate developer who loves building web applications. I have experience with Python, JavaScript, and modern web frameworks.',
                  'your.email@example.com', '+1 (555) 123-4567', 'New York, USA', 
                  'https://via.placeholder.com/150',
                  'https://github.com/yourprofile',
                  'https://linkedin.com/in/yourprofile',
                  'https://twitter.com/yourprofile',
                  'https://yourwebsite.com',
                  3, 'Available'))
            
            # Insert sample projects
            cursor.execute('''
                INSERT INTO projects (title, description, technologies, github_url, demo_url)
                VALUES (?, ?, ?, ?, ?)
            ''', ('Portfolio Website', 'A full-stack personal portfolio to showcase projects and skills', 'Python, Flask, SQLite', 'https://github.com', 'https://demo.com'))
            
            # Insert sample skills
            cursor.execute('''
                INSERT INTO skills (name, proficiency, category)
                VALUES (?, ?, ?)
            ''', ('Python', 'Expert', 'Backend'))
            
            cursor.execute('''
                INSERT INTO skills (name, proficiency, category)
                VALUES (?, ?, ?)
            ''', ('JavaScript', 'Advanced', 'Frontend'))
            
            conn.commit()
            conn.close()
            print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        traceback.print_exc()

# Initialize database on startup
init_db()

@app.route('/')
def index():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM profile LIMIT 1')
        profile = cursor.fetchone()
        
        cursor.execute('SELECT * FROM projects ORDER BY created_at DESC')
        projects = cursor.fetchall()
        
        cursor.execute('SELECT * FROM skills ORDER BY category')
        skills = cursor.fetchall()
        
        conn.close()
        
        return render_template('index.html', profile=profile, projects=projects, skills=skills)
    except Exception as e:
        print(f"Error in index route: {e}")
        traceback.print_exc()
        return f"Error: {e}", 500

# ===== PROFILE ROUTES =====
@app.route('/api/profile', methods=['GET', 'POST', 'PUT'])
def manage_profile():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        if request.method == 'GET':
            cursor.execute('SELECT * FROM profile LIMIT 1')
            profile = cursor.fetchone()
            conn.close()
            return jsonify(dict(profile) if profile else {})
        
        elif request.method == 'POST':
            data = request.json
            cursor.execute('''
                INSERT INTO profile (name, title, bio, email, phone, location, avatar_url, 
                                    github_url, linkedin_url, twitter_url, website_url, 
                                    years_experience, resume_url, availability_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (data['name'], data['title'], data['bio'], 
                  data.get('email'), data.get('phone'), data.get('location'), data.get('avatar_url'),
                  data.get('github_url'), data.get('linkedin_url'), data.get('twitter_url'), 
                  data.get('website_url'), data.get('years_experience'), data.get('resume_url'),
                  data.get('availability_status')))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Profile created successfully'}), 201
        
        elif request.method == 'PUT':
            data = request.json
            cursor.execute('''
                UPDATE profile 
                SET name=?, title=?, bio=?, email=?, phone=?, location=?, avatar_url=?, 
                    github_url=?, linkedin_url=?, twitter_url=?, website_url=?, 
                    years_experience=?, resume_url=?, availability_status=?, updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ''', (data['name'], data['title'], data['bio'], 
                  data.get('email'), data.get('phone'), data.get('location'), data.get('avatar_url'),
                  data.get('github_url'), data.get('linkedin_url'), data.get('twitter_url'), 
                  data.get('website_url'), data.get('years_experience'), data.get('resume_url'),
                  data.get('availability_status'), data['id']))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Profile updated successfully'}), 200
            
    except Exception as e:
        print(f"Error in manage_profile: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ===== PROJECT ROUTES =====
@app.route('/api/projects', methods=['GET', 'POST'])
def manage_projects():
    try:
        if request.method == 'POST':
            data = request.json
            conn = get_db()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO projects (title, description, technologies, image_url, github_url, demo_url)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (data['title'], data['description'], data['technologies'], 
                  data.get('image_url'), data.get('github_url'), data.get('demo_url')))
            
            conn.commit()
            project_id = cursor.lastrowid
            conn.close()
            
            return jsonify({'id': project_id, 'message': 'Project added successfully'}), 201
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM projects ORDER BY created_at DESC')
        projects = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify(projects)
    except Exception as e:
        print(f"Error in manage_projects: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['DELETE', 'PUT'])
def modify_project(project_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        if request.method == 'DELETE':
            cursor.execute('DELETE FROM projects WHERE id=?', (project_id,))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Project deleted successfully'}), 200
        
        elif request.method == 'PUT':
            data = request.json
            cursor.execute('''
                UPDATE projects 
                SET title=?, description=?, technologies=?, image_url=?, github_url=?, demo_url=?
                WHERE id=?
            ''', (data['title'], data['description'], data['technologies'], 
                  data.get('image_url'), data.get('github_url'), data.get('demo_url'), project_id))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Project updated successfully'}), 200
            
    except Exception as e:
        print(f"Error in modify_project: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ===== SKILLS ROUTES =====
@app.route('/api/skills', methods=['GET', 'POST'])
def manage_skills():
    try:
        if request.method == 'POST':
            data = request.json
            conn = get_db()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO skills (name, proficiency, category)
                VALUES (?, ?, ?)
            ''', (data['name'], data['proficiency'], data['category']))
            
            conn.commit()
            skill_id = cursor.lastrowid
            conn.close()
            
            return jsonify({'id': skill_id, 'message': 'Skill added successfully'}), 201
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM skills ORDER BY category')
        skills = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify(skills)
    except Exception as e:
        print(f"Error in manage_skills: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/skills/<int:skill_id>', methods=['DELETE', 'PUT'])
def modify_skill(skill_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        if request.method == 'DELETE':
            cursor.execute('DELETE FROM skills WHERE id=?', (skill_id,))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Skill deleted successfully'}), 200
        
        elif request.method == 'PUT':
            data = request.json
            cursor.execute('''
                UPDATE skills 
                SET name=?, proficiency=?, category=?
                WHERE id=?
            ''', (data['name'], data['proficiency'], data['category'], skill_id))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Skill updated successfully'}), 200
            
    except Exception as e:
        print(f"Error in modify_skill: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ===== CONTACT ROUTES =====
@app.route('/api/contact', methods=['POST'])
def contact():
    try:
        data = request.json
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO contact (name, email, message)
            VALUES (?, ?, ?)
        ''', (data['name'], data['email'], data['message']))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Message received successfully'}), 201
    except Exception as e:
        print(f"Error in contact: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)