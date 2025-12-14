export interface WebhookEvent {
  sessionId: string;
  event: 'message_create' | 'message_ack' | 'message_edit' | 'message_revoke_everyone' | 'change_state' | 'change_battery' | 'disconnected';
  timestamp: number;
  data: any;
}
