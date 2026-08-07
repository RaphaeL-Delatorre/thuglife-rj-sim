REVOKE ALL ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO service_role;