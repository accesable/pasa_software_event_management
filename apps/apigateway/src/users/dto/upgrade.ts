import { IsIn } from "class-validator";

export class UpgradeDto {
    @IsIn(['teacher', 'organizer', 'student'], { message: 'Invalid role' })
    role: string;
}