import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zraejbpvbknesknhvfxn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYWVqYnB2YmtuZXNrbmh2ZnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDg5MjQsImV4cCI6MjA3NzI4NDkyNH0.mUh1zO6jnEeqvWPVD_x7rtTKbnJkAef5Jk4A3q4itI8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
