export const parseProfile = (profile: any) => {
  if (!profile) return null;

  // Create a company object if companies data is present
  const company = profile.companies ? {
    id: profile.companies.id,
    name: profile.companies.name,
    domain: profile.companies.domain,
    logo: profile.companies.logo,
  } : null;

  // Build the profile object with company data
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    company_id: profile.company_id,
    companies: profile.companies,
    company, // Add the parsed company object
    isCompanyAdmin: false, // This will be set elsewhere if needed
  };
};
