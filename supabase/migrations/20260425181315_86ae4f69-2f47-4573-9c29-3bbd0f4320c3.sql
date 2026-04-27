CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are public read"
ON public.app_settings FOR SELECT
USING (true);

INSERT INTO public.app_settings (key, value)
VALUES ('checkout_redirect_url', 'https://external-portal.example.com');
