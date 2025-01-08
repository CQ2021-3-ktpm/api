export interface NotificationEvents {
  sendNotification(userId: string, notification: any): Promise<void>;
}
