import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  enrollmentId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { enrollmentId }: EmailRequest = await req.json();

    console.log('Processing enrollment:', enrollmentId);

    // Get enrollment details with contact and sequence info
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('sequence_enrollments')
      .select(`
        *,
        contacts:contact_id (
          id,
          first_name,
          last_name,
          email
        ),
        email_sequences:sequence_id (
          id,
          name
        )
      `)
      .eq('id', enrollmentId)
      .single();

    if (enrollmentError || !enrollment) {
      throw new Error('Enrollment not found');
    }

    // Get the current step
    const { data: step, error: stepError } = await supabase
      .from('sequence_steps')
      .select('*')
      .eq('sequence_id', enrollment.sequence_id)
      .eq('step_number', enrollment.current_step + 1)
      .single();

    if (stepError || !step) {
      console.log('No more steps, marking enrollment as completed');
      
      await supabase
        .from('sequence_enrollments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      return new Response(
        JSON.stringify({ message: 'Sequence completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contact = enrollment.contacts as any;

    // Personalize email content
    const personalizedSubject = step.subject
      .replace(/\{\{first_name\}\}/g, contact.first_name)
      .replace(/\{\{last_name\}\}/g, contact.last_name)
      .replace(/\{\{email\}\}/g, contact.email);

    const personalizedBody = step.body
      .replace(/\{\{first_name\}\}/g, contact.first_name)
      .replace(/\{\{last_name\}\}/g, contact.last_name)
      .replace(/\{\{email\}\}/g, contact.email);

    // Send email via Resend
    console.log('Sending email to:', contact.email);
    
    const emailResponse = await resend.emails.send({
      from: 'CRM System <onboarding@resend.dev>',
      to: [contact.email],
      subject: personalizedSubject,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        ${personalizedBody.split('\n').map((line: string) => `<p>${line}</p>`).join('')}
      </div>`,
    });

    console.log('Email sent:', emailResponse);

    // Calculate next send time
    const nextSendAt = new Date();
    nextSendAt.setDate(nextSendAt.getDate() + step.delay_days);
    nextSendAt.setHours(nextSendAt.getHours() + step.delay_hours);

    // Update enrollment
    await supabase
      .from('sequence_enrollments')
      .update({ 
        current_step: enrollment.current_step + 1,
        next_send_at: nextSendAt.toISOString()
      })
      .eq('id', enrollmentId);

    // Log the email
    await supabase
      .from('emails')
      .insert({
        user_id: enrollment.user_id,
        contact_id: contact.id,
        subject: personalizedSubject,
        body: personalizedBody,
        to_email: contact.email,
        from_email: 'onboarding@resend.dev',
        is_outbound: true,
        sent_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        nextStep: enrollment.current_step + 1,
        nextSendAt: nextSendAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending sequence email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
