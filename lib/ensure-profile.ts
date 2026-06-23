import { supabase } from "@/lib/supabase";

// Makes sure the signed-in user has a row in user_profiles. The DB trigger
// handles this on sign-up, but this self-heals accounts created before the
// table existed (e.g. after a schema reset) so child inserts never hit the
// owner_id foreign-key constraint.
export async function ensureProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("user_profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        name: (user.user_metadata?.name as string) ?? "",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
}
