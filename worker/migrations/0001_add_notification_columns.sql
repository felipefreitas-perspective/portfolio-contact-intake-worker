ALTER TABLE contact_inquiries ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE contact_inquiries ADD COLUMN notification_provider TEXT;
ALTER TABLE contact_inquiries ADD COLUMN notification_id TEXT;
ALTER TABLE contact_inquiries ADD COLUMN notification_error TEXT;
ALTER TABLE contact_inquiries ADD COLUMN notified_at TEXT;
