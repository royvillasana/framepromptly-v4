// Test script to check if database tables exist
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drfaomantrtmtydbelxe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyZmFvbWFudHJ0bXR5ZGJlbHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDM1NjQsImV4cCI6MjA1MTA3OTU2NH0.e4MWyGsheLgGgJfGnUfTASkiLVyX7Y4avPGBUhTKy_Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking if invitation tables exist...');
  
  try {
    // Check if project_invitations table exists
    const { data: invitations, error: invError } = await supabase
      .from('project_invitations')
      .select('count')
      .limit(1);
    
    console.log('project_invitations table check:', invError ? 'ERROR: ' + invError.message : 'EXISTS');
    
    // Check if project_members table exists  
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('count')
      .limit(1);
      
    console.log('project_members table check:', membersError ? 'ERROR: ' + membersError.message : 'EXISTS');
    
    // Check projects table (should exist)
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
      
    console.log('projects table check:', projectsError ? 'ERROR: ' + projectsError.message : 'EXISTS');
    
  } catch (error) {
    console.error('General error:', error);
  }
}

checkTables();