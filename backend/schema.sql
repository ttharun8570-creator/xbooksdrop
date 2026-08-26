-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    college_name VARCHAR(255),
    college_id VARCHAR(100),
    phone VARCHAR(50),
    profile_photo_url TEXT,
    role VARCHAR(50) DEFAULT 'USER',
    is_verified BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    book_id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(category_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    condition VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    edition VARCHAR(100),
    publication_year INTEGER,
    status VARCHAR(50) DEFAULT 'PENDING',
    admin_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Book Images table
CREATE TABLE IF NOT EXISTS book_images (
    image_id BIGSERIAL PRIMARY KEY,
    book_id BIGINT REFERENCES books(book_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default categories
INSERT INTO categories (name, description) VALUES
('Programming & CS', 'Programming, software engineering, databases, AI, and CS books'),
('Mathematics & Statistics', 'Calculus, algebra, probability, discrete math, and statistics'),
('Engineering & Technology', 'Mechanical, electrical, civil, chemical, and general engineering'),
('Science & Physics', 'Physics, chemistry, biology, and natural sciences'),
('Business & Economics', 'Finance, accounting, marketing, management, and economics'),
('Medical & Healthcare', 'Medicine, nursing, anatomy, pharmacology, and health'),
('Humanities & Social Sciences', 'History, philosophy, sociology, psychology, and literature'),
('General & Others', 'General education, competitive exams, novels, and others')
ON CONFLICT (name) DO NOTHING;
