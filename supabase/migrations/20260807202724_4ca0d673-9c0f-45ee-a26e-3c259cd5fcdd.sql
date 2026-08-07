REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO service_role;