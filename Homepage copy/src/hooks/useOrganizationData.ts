import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrganizationData {
  id?: string;
  logo_url?: string;
  website_url?: string;
  loading: boolean;
  error: string | null;
}

interface UpdateOrganizationData {
  logo_url?: string;
  website_url?: string;
}

export const useOrganizationData = () => {
  const { user } = useAuth();
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    loading: true,
    error: null,
  });

  // Migrate localStorage data to organization when user becomes authenticated
  const migrateLocalStorageData = async (organizationId: string) => {
    try {
      const localLogoUrl = localStorage.getItem("uploadedLogoUrl");
      const localWebsiteUrl = localStorage.getItem("companyUrl");

      if (!localLogoUrl && !localWebsiteUrl) {
        return; // Nothing to migrate
      }

      // Check if organization already has data (don't overwrite existing data)
      const { data: currentOrg } = await supabase
        .from("organizations")
        .select("logo_url, website_url")
        .eq("id", organizationId)
        .single();

      const updates: { logo_url?: string; website_url?: string } = {};

      // Only migrate if current org data is empty/null
      if (localLogoUrl && !currentOrg?.logo_url) {
        updates.logo_url = localLogoUrl;
      }
      if (localWebsiteUrl && !currentOrg?.website_url) {
        updates.website_url = localWebsiteUrl;
      }

      // Update organization if there's data to migrate
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("organizations")
          .update(updates)
          .eq("id", organizationId);

        if (!error) {
          // Clear localStorage after successful migration
          if (updates.logo_url) {
            localStorage.removeItem("uploadedLogoUrl");
          }
          if (updates.website_url) {
            localStorage.removeItem("companyUrl");
          }
          console.log(
            "Successfully migrated localStorage data to organization"
          );
        }
      }
    } catch (error) {
      console.error("Error migrating localStorage data:", error);
      // Don't throw - migration failure shouldn't block the app
    }
  };

  // Load organization data for authenticated users
  const loadOrganizationData = async () => {
    if (!user) {
      setOrganizationData({ loading: false, error: null });
      return;
    }

    try {
      setOrganizationData((prev) => ({ ...prev, loading: true, error: null }));

      // Get user's organization(s) - they might be in multiple
      const { data: orgMemberList, error: orgError } = await supabase
        .from("organization_members")
        .select("organization_id, joined_at")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false }); // Most recently joined first

      if (orgError) {
        console.error("Error fetching organization member:", orgError);
        setOrganizationData({
          loading: false,
          error: "Failed to load organization data",
        });
        return;
      }

      if (!orgMemberList || orgMemberList.length === 0) {
        setOrganizationData({ loading: false, error: "No organization found" });
        return;
      }

      // Use the most recently joined organization (last invited organization)
      const orgMember = orgMemberList[0];

      // Migrate localStorage data before loading organization data
      await migrateLocalStorageData(orgMember.organization_id);

      // Get organization data (after potential migration)
      const { data: organization, error: orgDataError } = await supabase
        .from("organizations")
        .select("id, logo_url, website_url")
        .eq("id", orgMember.organization_id)
        .single();

      if (orgDataError) {
        console.error("Error fetching organization data:", orgDataError);
        setOrganizationData({
          loading: false,
          error: "Failed to load organization data",
        });
        return;
      }

      setOrganizationData({
        id: organization.id,
        logo_url: organization.logo_url,
        website_url: organization.website_url,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading organization data:", error);
      setOrganizationData({
        loading: false,
        error: "Failed to load organization data",
      });
    }
  };

  // Update organization data
  const updateOrganizationData = useCallback(
    async (updates: UpdateOrganizationData) => {
      if (!user || !organizationData.id) {
        console.error("No user or organization ID available");
        return false;
      }

      try {
        const { error } = await supabase
          .from("organizations")
          .update(updates)
          .eq("id", organizationData.id);

        if (error) {
          console.error("Error updating organization:", error);
          toast.error("Failed to update organization data");
          return false;
        }

        // Update local state
        setOrganizationData((prev) => ({
          ...prev,
          ...updates,
        }));

        return true;
      } catch (error) {
        console.error("Error updating organization data:", error);
        toast.error("Failed to update organization data");
        return false;
      }
    },
    [user, organizationData.id]
  );

  // Get logo URL (organization data for authenticated users, localStorage for unauthenticated)
  const getLogoUrl = useCallback((): string | null => {
    if (user && organizationData.logo_url) {
      return organizationData.logo_url;
    }
    if (!user) {
      return localStorage.getItem("uploadedLogoUrl");
    }
    return null;
  }, [user, organizationData.logo_url]);

  // Set logo URL (organization data for authenticated users, localStorage for unauthenticated)
  const setLogoUrl = useCallback(
    async (logoUrl: string | null) => {
      if (user) {
        await updateOrganizationData({ logo_url: logoUrl });
      } else {
        if (logoUrl) {
          localStorage.setItem("uploadedLogoUrl", logoUrl);
        } else {
          localStorage.removeItem("uploadedLogoUrl");
        }
      }
    },
    [user, updateOrganizationData]
  );

  // Get website URL (organization data for authenticated users, localStorage for unauthenticated)
  const getWebsiteUrl = useCallback((): string | null => {
    if (user && organizationData.website_url) {
      return organizationData.website_url;
    }
    if (!user) {
      return localStorage.getItem("companyUrl");
    }
    return null;
  }, [user, organizationData.website_url]);

  // Set website URL (organization data for authenticated users, localStorage for unauthenticated)
  const setWebsiteUrl = useCallback(
    async (websiteUrl: string | null) => {
      if (user) {
        await updateOrganizationData({ website_url: websiteUrl });
      } else {
        if (websiteUrl) {
          localStorage.setItem("companyUrl", websiteUrl);
        } else {
          localStorage.removeItem("companyUrl");
        }
      }
    },
    [user, updateOrganizationData]
  );

  useEffect(() => {
    loadOrganizationData();
  }, [user]);

  return {
    organizationData,
    loadOrganizationData,
    updateOrganizationData,
    getLogoUrl,
    setLogoUrl,
    getWebsiteUrl,
    setWebsiteUrl,
  };
};
