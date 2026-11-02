import { describe, it, expect } from 'vitest';
import { classifyEmailReply, ReplyClassificationSchema } from '@/lib/ai/gemini';

describe('Reply Intent Classification & Safe Handling', () => {
  it('should validate schema conforming classifications', () => {
    const sample = {
      classification: 'meeting_request',
      confidence_score: 0.95,
      summary: 'Prospect requested 15-minute Zoom call on Thursday.',
      opt_out_detected: false,
      recommended_action: 'update_pipeline_meeting',
    };

    const parsed = ReplyClassificationSchema.parse(sample);
    expect(parsed.classification).toBe('meeting_request');
    expect(parsed.opt_out_detected).toBe(false);
  });

  it('should deterministically categorize unsubscribe regardless of AI prompt content', async () => {
    const result = await classifyEmailReply({
      fromEmail: 'director@prospect.com',
      subject: 'Re: Logistics software note',
      bodyText: 'Please unsubscribe me and take me off your list.',
    });

    expect(result.classification).toBe('unsubscribe');
    expect(result.opt_out_detected).toBe(true);
    expect(result.recommended_action).toBe('suppress_contact');
  });

  it('should deterministically categorize mailer bounces', async () => {
    const result = await classifyEmailReply({
      fromEmail: 'mailer-daemon@googlemail.com',
      subject: 'Delivery Status Notification (Failure)',
      bodyText: 'The response was: 550 5.1.1 The email account that you tried to reach does not exist.',
    });

    expect(result.classification).toBe('bounce');
    expect(result.recommended_action).toBe('suppress_contact');
  });

  it('should categorize meeting requests accurately', async () => {
    const result = await classifyEmailReply({
      fromEmail: 'ops@fmcg-distributor.demo',
      subject: 'Re: Distributor Portal Software',
      bodyText: 'We would like to discuss this. Can we set up a call next Tuesday to review the portal demo?',
    });

    expect(result.classification).toBe('meeting_request');
    expect(result.recommended_action).toBe('update_pipeline_meeting');
  });
});
