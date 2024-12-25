import { NOTIFICATION_SERVICE_PROTO_SERVICE_NAME, NotificationServiceProtoClient } from '@app/common/types/notification';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { NOTIFICATION_SERVICE } from 'apps/apigateway/src/constants/service.constant';

@Injectable()
export class NotificationService implements OnModuleInit {
    private notificationService: NotificationServiceProtoClient;

    constructor(
        @Inject(NOTIFICATION_SERVICE) private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.notificationService = this.client.getService<NotificationServiceProtoClient>(NOTIFICATION_SERVICE_PROTO_SERVICE_NAME);
    }

    async sendMailForForgotPassword(email: string, id: string, name: string) {
        try {
            return this.notificationService.forgotPassword({email, id, name}).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }
}
