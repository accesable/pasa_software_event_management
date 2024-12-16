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
} from 'class-validator';

import { Type } from 'class-transformer';

@ValidatorConstraint({ name: "IsGreaterDate", async: false })
class IsGreaterDateConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean {
        const startDate = new Date(args.object['startDate']);
        const endDate = new Date(value);

        return startDate < endDate; // Ensure startDate < endDate
    }

    defaultMessage(args: ValidationArguments): string {
        return `EndDate must be greater than StartDate`;
    }
}

@ValidatorConstraint({ name: 'IsPriceValid', async: false })
export class IsPriceValidConstraint implements ValidatorConstraintInterface {
    validate(price: number, args: ValidationArguments): boolean {
        const isFree = args.object['isFree']; // Lấy giá trị của `isFree` từ object đang được kiểm tra

        if (isFree === true) {
            return price === 0; // Nếu isFree = true, price phải = 0
        } else {
            return price > 0; // Nếu isFree = false, price phải > 0
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
            return false; // Trường hợp giá trị không tồn tại
        }

        const currentDate = new Date(); // Lấy ngày hiện tại
        return value > currentDate; // Kiểm tra giá trị phải lớn hơn ngày hiện tại
    }

    defaultMessage(args: ValidationArguments): string {
        return `${args.property} must be a future date`; // Thông báo lỗi
    }
}

export class CreateEventDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be string' })
    name: string;

    @IsNotEmpty({ message: 'Description is required' })
    @IsString({ message: 'Description must be string' })
    description: string;

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
    location: string;

    @IsOptional()
    @IsMongoId({ each: true, message: "Invalid id" })
    speaker?: string[];

    @IsOptional()
    @IsMongoId({ each: true, message: "Invalid id" })
    guest?: string[];

    @IsNotEmpty({ message: "Category id  is required" })
    @IsMongoId({ message: "Invalid category Id" })
    categoryId: string;

    @IsOptional()
    @IsBoolean({ message: "isFree must be boolean" })
    isFree?: boolean;

    @IsOptional()
    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0, { message: 'Price must be greater than or equal to 0' })
    @Validate(IsPriceValidConstraint)
    price: number;

    @IsOptional()
    @IsNumber({}, { message: 'Max participants must be a number' })
    @Min(0, { message: 'Max participants must be greater than or equal to 0' })
    maxParticipants: number;

    @IsOptional()
    @IsString({ message: "banner url must be string" })
    banner?: string;

    @IsOptional()
    @IsString({ message: "video url must be string" })
    videoIntro?: string;

    @IsOptional()
    otherDocument?: string[];
}