import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class ReportServiceService implements OnModuleInit {
    
    onModuleInit() {
        console.log('ReportServiceService has been initialized.');
    }
}
