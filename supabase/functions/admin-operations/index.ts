
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
        result = await createUser(supabaseClient, data);
        break;
      case "updateUser":
        result = await updateUser(supabaseClient, data);
        break;
      case "deleteUser":
        result = await deleteUser(supabaseClient, data.userId);
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
async function createUser(supabaseClient, userData) {
  try {
    // Create the user in Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: userData.email,
      password: userData.password || Math.random().toString(36).slice(-8),
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        role: userData.role
      }
    });

    if (authError) throw authError;

    // Log the action
    await logAdminAction(supabaseClient, userData.adminId, 'Created user', 'user', authData.user.id);

    return { success: true, user: authData.user };
  } catch (error) {
    console.error("Error creating user:", error.message);
    return { success: false, error: error.message };
  }
}

// Function to update a user
async function updateUser(supabaseClient, userData) {
  try {
    // Update user metadata
    const { data: authData, error: authError } = await supabaseClient.auth.admin.updateUserById(
      userData.userId,
      { user_metadata: { name: userData.name, role: userData.role } }
    );

    if (authError) throw authError;

    // Update the profile data
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({
        name: userData.name,
        role: userData.role
      })
      .eq("id", userData.userId);

    if (profileError) throw profileError;

    // Log the action
    await logAdminAction(supabaseClient, userData.adminId, 'Updated user', 'user', userData.userId);

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error.message);
    return { success: false, error: error.message };
  }
}

// Function to delete a user
async function deleteUser(supabaseClient, userId) {
  try {
    const { error } = await supabaseClient.auth.admin.deleteUser(userId);
    if (error) throw error;
    
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
