
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the current user from the authorization header
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: currentUser },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !currentUser) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if the current user is an admin
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can perform this operation" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract operation and data from request
    const { operation, data } = await req.json();

    let result;

    // Handle different operations
    switch (operation) {
      case "createUser":
        result = await createUser(supabaseClient, currentUser.id, data);
        break;
      case "updateUser":
        result = await updateUser(supabaseClient, currentUser.id, data);
        break;
      case "deleteUser":
        result = await deleteUser(supabaseClient, currentUser.id, data.userId);
        break;
      case "updateContent":
        result = await updateContent(supabaseClient, currentUser.id, data);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid operation" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Function to create a new user
async function createUser(supabaseClient, adminId, userData) {
  try {
    console.log("Creating user with data:", userData);
    
    // Create the user in Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password || Math.random().toString(36).slice(-8),
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role,
        region: userData.region
      }
    });

    if (authError) throw authError;

    // Log the action
    await logAdminAction(supabaseClient, adminId, 'Created user', 'user', authData.user.id);

    return { success: true, user: authData.user };
  } catch (error) {
    console.error("Error creating user:", error.message);
    return { success: false, error: error.message };
  }
}

// Function to update a user
async function updateUser(supabaseClient, adminId, userData) {
  try {
    console.log("Updating user with data:", userData);
    
    const updateData = { 
      user_metadata: { 
        name: userData.name, 
        role: userData.role,
        region: userData.region
      } 
    };
    
    // Only include password if it's provided
    if (userData.password) {
      updateData.password = userData.password;
    }
    
    // Update user metadata and optionally password
    const { data: authData, error: authError } = await supabaseClient.auth.admin.updateUserById(
      userData.id,
      updateData
    );

    if (authError) throw authError;

    // Update the profile data directly without checking constraint
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({
        name: userData.name,
        role: userData.role
      })
      .eq("id", userData.id);

    if (profileError) throw profileError;
    
    // If user is a candidate, update region
    if (userData.role === 'candidate') {
      // Check if candidate record exists
      const { data: candidateData, error: checkError } = await supabaseClient
        .from('candidates')
        .select('id')
        .eq('id', userData.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (candidateData) {
        // Update existing candidate record
        const { error: updateCandidateError } = await supabaseClient
          .from('candidates')
          .update({ region: userData.region })
          .eq('id', userData.id);
          
        if (updateCandidateError) throw updateCandidateError;
      } else {
        // Create new candidate record
        const { error: insertCandidateError } = await supabaseClient
          .from('candidates')
          .insert({ 
            id: userData.id,
            region: userData.region
          });
          
        if (insertCandidateError) throw insertCandidateError;
      }
    }
    
    // If user is a manager, hr, or director, update region
    if (['manager', 'hr', 'director'].includes(userData.role)) {
      // Check if manager record exists
      const { data: managerData, error: checkError } = await supabaseClient
        .from('managers')
        .select('id')
        .eq('id', userData.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (!managerData) {
        // Create manager record if it doesn't exist
        const { error: insertManagerError } = await supabaseClient
          .from('managers')
          .insert({ id: userData.id });
          
        if (insertManagerError) throw insertManagerError;
      }
      
      // Update or create manager region
      if (userData.region) {
        // First check if the manager has this region already
        const { data: regionData, error: checkRegionError } = await supabaseClient
          .from('manager_regions')
          .select('id')
          .eq('manager_id', userData.id)
          .eq('region', userData.region)
          .single();
          
        if (checkRegionError && checkRegionError.code !== 'PGRST116') {
          throw checkRegionError;
        }
        
        if (!regionData) {
          // Add the region if it doesn't exist
          const { error: insertRegionError } = await supabaseClient
            .from('manager_regions')
            .insert({ 
              manager_id: userData.id,
              region: userData.region
            });
            
          if (insertRegionError) throw insertRegionError;
        }
      }
    }

    // Log the action
    await logAdminAction(supabaseClient, adminId, 'Updated user', 'user', userData.id);

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error.message);
    return { success: false, error: error.message };
  }
}

// Function to delete a user
async function deleteUser(supabaseClient, adminId, userId) {
  try {
    console.log("Deleting user:", userId);
    
    // Delete the user using the admin API
    const { error } = await supabaseClient.auth.admin.deleteUser(userId);
    if (error) throw error;
    
    // Log the action
    await logAdminAction(supabaseClient, adminId, 'Deleted user', 'user', userId);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error.message);
    return { success: false, error: error.message };
  }
}

// Function to update content (assessments, videos, quizzes)
async function updateContent(supabaseClient, adminId, contentData) {
  try {
    const { contentType, action, data } = contentData;
    let result;
    
    // Determine the table based on content type
    let table;
    switch (contentType) {
      case 'assessment':
        table = 'assessments';
        break;
      case 'video':
        table = 'videos';
        break;
      case 'training_module':
        table = 'training_modules';
        break;
      default:
        throw new Error('Invalid content type');
    }
    
    // Perform the requested action
    switch (action) {
      case 'create':
        // Add created_by field
        data.created_by = adminId;
        
        const { data: insertedData, error: insertError } = await supabaseClient
          .from(table)
          .insert(data)
          .select()
          .single();
          
        if (insertError) throw insertError;
        result = insertedData;
        
        // Log the action
        await logAdminAction(
          supabaseClient, 
          adminId, 
          `Created ${contentType}`, 
          contentType, 
          insertedData.id
        );
        break;
        
      case 'update':
        const { data: updatedData, error: updateError } = await supabaseClient
          .from(table)
          .update(data)
          .eq('id', data.id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        result = updatedData;
        
        // Log the action
        await logAdminAction(
          supabaseClient, 
          adminId, 
          `Updated ${contentType}`, 
          contentType, 
          data.id
        );
        break;
        
      case 'delete':
        const { error: deleteError } = await supabaseClient
          .from(table)
          .delete()
          .eq('id', data.id);
          
        if (deleteError) throw deleteError;
        result = { id: data.id };
        
        // Log the action
        await logAdminAction(
          supabaseClient, 
          adminId, 
          `Deleted ${contentType}`, 
          contentType, 
          data.id
        );
        break;
        
      default:
        throw new Error('Invalid action');
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error ${contentData.action}ing ${contentData.contentType}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Helper function to log admin actions
async function logAdminAction(supabaseClient, adminId, action, entityType, entityId) {
  try {
    await supabaseClient.from('activity_logs').insert({
      user_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId
    });
  } catch (error) {
    console.error('Error logging action:', error.message);
    // Don't throw error so main operation can still succeed
  }
}
