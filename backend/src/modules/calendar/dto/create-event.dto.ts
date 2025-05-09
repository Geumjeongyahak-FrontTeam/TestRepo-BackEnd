import { IsEnum, IsString, IsDate, IsOptional, IsBoolean, IsArray, IsNumber,  } from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '../../../libs/interface/calendar.interface';
import { ClassType } from '../../../libs/interface/shared/class.interface'

export class CreateEventDto {
  @IsEnum(EventType)
  event_type!: EventType;

  @IsDate()
  @Type(() => Date)
  event_date!: Date;

  @IsOptional()
  @IsEnum(ClassType)
  class_type?: ClassType;

  @IsString()
  description!: string;

  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @IsString()
  recurrence_pattern?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  teacher_ids?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  student_ids?: number[];
}