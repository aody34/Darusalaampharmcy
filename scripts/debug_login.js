
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umjjujsonbrvbsmneani.supabase.co';
const supabaseKey = 'sb_publishable_fuJyvk2MMip93WWoWi4OAA_52VeC4oC'; // From user's .env.local

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('\nAttempting login for: apdyakdir41@gmail.com');
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'apdyakdir41@gmail.com',
            password: 'Abdulkadir143@'
        });

        if (error) {
            console.error('❌ Login Failed:', error.message);
            console.error('Error Details:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Login Successful!');
            console.log('User ID:', data.user.id);
            console.log('Email:', data.user.email);
            console.log('Role:', data.user.role);
        }
    } catch (e) {
        console.error('❌ Unexpected Error:', e);
    }
}

testLogin();
