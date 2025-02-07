import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { NOTIFICATION_SERVICE } from '../constants/service.constant';
import { NotificationServiceProtoClient, NOTIFICATION_SERVICE_PROTO_SERVICE_NAME } from '../../../../libs/common/src/types/notification';

@Injectable()
export class NotificationService implements OnModuleInit {
    private notificationService: NotificationServiceProtoClient;

    constructor(
        @Inject(NOTIFICATION_SERVICE) private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.notificationService = this.client.getService<NotificationServiceProtoClient>(NOTIFICATION_SERVICE_PROTO_SERVICE_NAME);
    }

    async sendMailForForgotPassword(email: string, id: string, name: string, newPassword: string) {
        try {
            return this.notificationService.forgotPassword({email, id, name, newPassword}).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }
}
