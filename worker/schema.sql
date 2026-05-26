CREATE TABLE IF NOT EXISTS contact_inquiries (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    inquiry_type TEXT NOT NULL,
    message TEXT NOT NULL,
    source_page TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notification_status TEXT NOT NULL DEFAULT 'pending',
    notification_provider TEXT,
    notification_id TEXT,
    notification_error TEXT,
    notified_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_site_created
ON contact_inquiries (site_id, created_at);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_site_status
ON contact_inquiries (site_id, status);
