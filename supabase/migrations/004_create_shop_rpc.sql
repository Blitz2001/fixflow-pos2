-- ================================================================
-- RPC for creating a shop and assigning the OWNER role atomically
-- Bypasses RLS chicken-and-egg problems by running as SECURITY DEFINER
-- ================================================================

CREATE OR REPLACE FUNCTION public.create_shop_with_owner(
  shop_name TEXT,
  shop_phone TEXT,
  shop_address TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_shop_id UUID;
BEGIN
  -- 1. Insert the shop
  INSERT INTO public.shops (name, phone, address, currency)
  VALUES (shop_name, shop_phone, shop_address, 'LKR')
  RETURNING id INTO new_shop_id;

  -- 2. Insert the owner membership for the user calling the function
  INSERT INTO public.memberships (user_id, shop_id, role)
  VALUES (auth.uid(), new_shop_id, 'OWNER');

  -- 3. Return the new shop ID
  RETURN new_shop_id;
END;
$$;
