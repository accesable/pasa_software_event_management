import {
    IsString,
    IsNotEmpty,
    IsDate,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsMongoId,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    Min,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: "IsGreaterDate", async: false })
class IsGreaterDateConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean {
        const startDate = new Date(args.object['startDate']);
        const endDate = new Date(value);
        return startDate < endDate;
    }

    defaultMessage(args: ValidationArguments): string {
        return `EndDate must be greater than StartDate`;
    }
}

@ValidatorConstraint({ name: 'IsPriceValid', async: false })
export class IsPriceValidConstraint implements ValidatorConstraintInterface {
    validate(price: number, args: ValidationArguments): boolean {
        const isFree = args.object['isFree'];
        if (isFree === true) {
            return price === 0;
        } else {
            return price > 0;
        }
    }

    defaultMessage(args: ValidationArguments): string {
        const isFree = args.object['isFree'];
        if (isFree === true) {
            return 'Price must be 0 when isFree is true';
        } else {
            return 'Price must be greater than 0 when isFree is false';
        }
    }
}

@ValidatorConstraint({ name: 'IsFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
    validate(value: Date): boolean {
        if (!value) {
            return false;
        }

        const currentDate = new Date();
        return value > currentDate;
    }

    defaultMessage(args: ValidationArguments): string {
        return `${args.property} must be a future date`;
    }
}

@ValidatorConstraint({ name: 'IsScheduleValid', async: false })
export class IsScheduleValidConstraint implements ValidatorConstraintInterface {
    validate(schedule: any[], args: ValidationArguments): boolean {
        const eventStartDate = new Date(args.object['startDate']);
        const eventEndDate = new Date(args.object['endDate']);

        for (const item of schedule) {
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);

            if (startTime <= new Date() || endTime <= new Date()) {
                return false;
            }

            if (startTime >= endTime) {
                return false;
            }

            if (startTime < eventStartDate || endTime > eventEndDate) {
                return false;
            }
        }

        return true;
    }

    defaultMessage(args: ValidationArguments): string {
        return `Each schedule's startTime and endTime must:
        - Be in the future,
        - Have startTime before endTime,
        - And fall within the event's startDate and endDate.`;
    }
}

export class CreateEventDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be string' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Description must be string' })
    description?: string;

    @IsNotEmpty({ message: 'Start Date is required' })
    @IsDate({ message: 'Start Date must be a date' })
    @Type(() => Date)
    @Validate(IsFutureDateConstraint)
    startDate: Date;

    @IsNotEmpty({ message: 'End Date is required' })
    @IsDate({ message: 'End Date must be a date' })
    @Type(() => Date)
    @Validate(IsGreaterDateConstraint)
    endDate: Date;

    @IsNotEmpty({ message: 'Location is required' })
    @IsString({ message: 'Location must be a string' })
    location: string;

    @IsNotEmpty({ message: "Category id is required" })
    @IsMongoId({ message: "Invalid category Id" })
    categoryId: string;

    @IsOptional()
    @IsBoolean({ message: "isFree must be boolean" })
    isFree?: boolean;

    @IsOptional()
    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0, { message: 'Price must be greater than or equal to 0' })
    @Validate(IsPriceValidConstraint)
    price?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Max participants must be a number' })
    @Min(0, { message: 'Max participants must be greater than or equal to 0' })
    maxParticipants?: number;

    @IsOptional()
    @IsString({ message: "banner url must be string" })
    banner?: string;

    @IsOptional()
    @IsString({ message: "video url must be string" })
    videoIntro?: string;

    @IsOptional()
    @IsArray({ message: 'Documents must be an array' })
    documents?: string[];

    @IsOptional()
    @IsArray({ message: 'Guest IDs must be an array' })
    guestIds?: string[];

    @IsOptional()
    @IsArray({ message: 'Schedule must be an array' })
    @Validate(IsScheduleValidConstraint, { message: 'Invalid schedule timing' })
    schedule?: {
        title: string;
        startTime: Date;
        endTime: Date;
        description?: string;
        speakerIds: string[];
    }[];

    @IsOptional()
    @IsArray({ message: 'Sponsors must be an array' })
    sponsors?: {
        name: string;
        logo?: string;
        website?: string;
        contribution: number;
    }[];

    @IsOptional()
    budget?: {
        totalBudget: number;
        expenses: { desc?: string; amount?: number; date?: Date }[];
        revenue: { desc?: string; amount?: number; date?: Date }[];
    };
}
