-- =========================================================================
-- Smart Indoor Navigation System - MySQL Database Schema & Seed Data
-- Compatible with MySQL 8.0+ / MariaDB 10.5+
-- Authoritative data store for buildings, floors, rooms, and graph topology
-- =========================================================================

CREATE DATABASE IF NOT EXISTS indoor_nav_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE indoor_nav_db;

-- 1. Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    category ENUM('academic', 'hospital', 'library', 'administration', 'mall') DEFAULT 'academic',
    floors_count INT NOT NULL DEFAULT 1,
    icon_name VARCHAR(64) DEFAULT 'building',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Floors Table
CREATE TABLE IF NOT EXISTS floors (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL,
    floor_number INT NOT NULL,
    name VARCHAR(128) NOT NULL,
    label VARCHAR(64) NOT NULL,
    description VARCHAR(255),
    svg_view_box VARCHAR(64) DEFAULT '0 0 1000 600',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY uq_building_floor (building_id, floor_number)
) ENGINE=InnoDB;

-- 3. Navigation Nodes Table (Graph Vertices)
CREATE TABLE IF NOT EXISTS navigation_nodes (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL,
    floor_number INT NOT NULL,
    x DOUBLE NOT NULL,
    y DOUBLE NOT NULL,
    label VARCHAR(128) NOT NULL,
    node_type ENUM('room', 'corridor', 'intersection', 'stairs', 'elevator', 'entrance') NOT NULL,
    location_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    INDEX idx_floor (building_id, floor_number)
) ENGINE=InnoDB;

-- 4. Locations Table (Rooms, Facilities, Points of Interest)
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL,
    floor_id VARCHAR(64) NOT NULL,
    floor_number INT NOT NULL,
    node_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    room_number VARCHAR(32),
    location_type ENUM('classroom', 'laboratory', 'office', 'washroom', 'stairs', 'elevator', 'entrance', 'cafeteria', 'library', 'auditorium', 'service') NOT NULL,
    description TEXT,
    keywords VARCHAR(255),
    is_accessible BOOLEAN DEFAULT TRUE,
    is_open BOOLEAN DEFAULT TRUE,
    operating_hours VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
    FOREIGN KEY (node_id) REFERENCES navigation_nodes(id) ON DELETE RESTRICT,
    INDEX idx_search (name, keywords)
) ENGINE=InnoDB;

-- 5. Navigation Edges Table (Graph Edges / Walkways / Stairs / Elevators)
CREATE TABLE IF NOT EXISTS navigation_edges (
    id VARCHAR(64) PRIMARY KEY,
    source_node_id VARCHAR(64) NOT NULL,
    target_node_id VARCHAR(64) NOT NULL,
    distance DOUBLE NOT NULL COMMENT 'Distance in meters',
    floor_number INT NOT NULL,
    is_accessible BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'False for stairs, True for elevator/ramps/walkways',
    is_closed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Blocked for cleaning/maintenance/construction',
    closure_reason VARCHAR(255),
    connection_type ENUM('walkway', 'stairs', 'elevator', 'ramp') NOT NULL DEFAULT 'walkway',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_node_id) REFERENCES navigation_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_node_id) REFERENCES navigation_nodes(id) ON DELETE CASCADE,
    INDEX idx_source (source_node_id),
    INDEX idx_target (target_node_id)
) ENGINE=InnoDB;

-- 6. Administrators Table (Authorized Backend Staff)
CREATE TABLE IF NOT EXISTS administrators (
    id VARCHAR(64) PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    full_name VARCHAR(128),
    role ENUM('super_admin', 'building_manager', 'editor') DEFAULT 'building_manager',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Route History (Optional analytics for crowd heatmaps)
CREATE TABLE IF NOT EXISTS route_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL,
    start_node_id VARCHAR(64) NOT NULL,
    target_node_id VARCHAR(64) NOT NULL,
    distance_meters DOUBLE,
    is_accessible_requested BOOLEAN,
    client_platform VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Campus Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('info', 'warning', 'alert') DEFAULT 'info',
    active BOOLEAN DEFAULT TRUE,
    author_uid VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================================
-- SEED DATA: Turing Science & Tech Complex (3 Floors)
-- =========================================================================

INSERT INTO buildings (id, name, code, description, category, floors_count, icon_name)
VALUES ('b-tech', 'Turing Science & Tech Complex', 'TST-01', 'Main academic and engineering facility featuring computer labs, lecture theaters, and administrative suites.', 'academic', 3, 'GraduationCap')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO floors (id, building_id, floor_number, name, label, description, svg_view_box) VALUES
('f-1', 'b-tech', 1, 'Ground Floor', 'Floor 1 (Ground)', 'Main Reception, Auditorium, Chemistry Lab, Cafeteria & Restrooms', '0 0 1000 600'),
('f-2', 'b-tech', 2, 'Second Floor', 'Floor 2 (Labs & Lecture)', 'AI & Robotics Lab, Lecture Hall 201, Faculty Lounge & Restrooms', '0 0 1000 600'),
('f-3', 'b-tech', 3, 'Third Floor', 'Floor 3 (Executive & Library)', 'Dean''s Office, Digital Library, Cyber Security Lab & Conference Room', '0 0 1000 600')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Sample Administrator
INSERT INTO administrators (id, firebase_uid, email, full_name, role)
VALUES ('admin-1', 'firebase-admin-uid-1', 'udayp3806@gmail.com', 'Teja Admin', 'super_admin')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Sample Announcements
INSERT INTO announcements (id, building_id, title, content, priority, active, author_uid) VALUES
('ann-1', 'b-tech', 'Robotics Demo & Open Lab Day', 'Live autonomous rover demonstrations today in AI Lab 204 from 14:00 to 16:30.', 'info', 1, 'firebase-admin-uid-1'),
('ann-2', 'b-tech', 'North Stairwell Maintenance Notice', 'Elevator Bank A is fully operational. Wheelchair users and visitors please use East Elevator for Floors 2 and 3.', 'warning', 1, 'firebase-admin-uid-1')
ON DUPLICATE KEY UPDATE title=VALUES(title);
