CREATE TABLE IF NOT EXISTS admins (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(80) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forms (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(120) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    draft_json LONGTEXT NOT NULL,
    draft_version INT UNSIGNED NOT NULL DEFAULT 1,
    published_version_id BIGINT UNSIGNED NULL,
    auto_next TINYINT(1) NOT NULL DEFAULT 1,
    device_name VARCHAR(255) NOT NULL DEFAULT '',
    slogan VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_form_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_versions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    form_id BIGINT UNSIGNED NOT NULL,
    version_number INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    schema_json LONGTEXT NOT NULL,
    auto_next TINYINT(1) NOT NULL DEFAULT 1,
    device_name VARCHAR(255) NOT NULL DEFAULT '',
    slogan VARCHAR(255) NOT NULL DEFAULT '',
    published_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_form_version (form_id, version_number),
    KEY idx_form_versions_form (form_id),
    CONSTRAINT fk_form_versions_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT fk_form_versions_admin FOREIGN KEY (published_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS responses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    form_id BIGINT UNSIGNED NOT NULL,
    form_version_id BIGINT UNSIGNED NOT NULL,
    response_json LONGTEXT NOT NULL,
    device_name VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    PRIMARY KEY (id),
    KEY idx_responses_form (form_id),
    KEY idx_responses_version (form_version_id),
    KEY idx_responses_created (created_at),
    CONSTRAINT fk_responses_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT fk_responses_version FOREIGN KEY (form_version_id) REFERENCES form_versions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_responses_admin FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    admin_id BIGINT UNSIGNED NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NULL,
    entity_id BIGINT UNSIGNED NULL,
    details_json LONGTEXT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY idx_audit_created (created_at),
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE forms
    ADD CONSTRAINT fk_forms_published_version
    FOREIGN KEY (published_version_id) REFERENCES form_versions(id) ON DELETE SET NULL;
