import { ClassType, AttendanceStatus } from "./shared/class.interface";
import { CalendarEventDescriptionEntity,
         CalendarSpecialEventDescriptionEntity
 } from "src/entities/calendar/calendar-description.entity";
import {  TeacherAttendanceEntity,
          StudentAttendanceEntity,
} from "src/entities/person.entity";

import { CalendarEventTeacherEntity,
         CalendarEventStudentEntity,
         ClassExchangeEntity,
         CalendarSpecialEventTeacherEntity,
         CalendarSpecialEventStudentEntity
} from "src/entities/calendar/calendar.entity"


export enum EventType {
    HOLIDAY = 'HOLIDAY',
    CLASS = 'CLASS',
    MEETING = 'MEETING',
    ACTIVITY = 'ACTIVITY'
  }

export type CalendarDay = Date;

export interface CalendarEvent {
    id: number;
    event_date: Date;
    event_type: EventType;
    class_type?: ClassType;
    created_at : Date;
    updated_at : Date;
    description: CalendarEventDescriptionEntity;
    teacher_attendances: TeacherAttendanceEntity[];
    student_attendances?: StudentAttendanceEntity[];
    teachers: CalendarEventTeacherEntity[];
    students?: CalendarEventStudentEntity[];
    exchange?: ClassExchangeEntity;
  }



export interface CalendarSpecialEvent {
    id : number;
    custom_event_type : string;
    event_start_date : Date;
    event_end_date : Date;
    created_at : Date;
    updated_at : Date;
    description: CalendarSpecialEventDescriptionEntity;
    teacher_attendances: TeacherAttendanceEntity[];
    student_attendances?: StudentAttendanceEntity[];
    teachers: CalendarSpecialEventTeacherEntity[];
    students?: CalendarSpecialEventStudentEntity[];
}
