import { 
  ClassType, 
  ClassSchedule, 
  StudentClassSchedule, 
  TeacherClassSchedule
} from "./shared/class.interface";


export interface Student {
  id: number;
  name: string;
  birth_date: Date;
  phone_number?: string;
  schedules: ClassSchedule[];  // 학생의 수업 일정을 직접 포함
}

export interface Teacher {
  id: number;
  name: string;
  birth_date: Date;
  phone_number?: string;
  schedules: ClassSchedule[];  // 선생님의 수업 일정을 직접 포함
}


export interface StudentEntity {
  id: number;
  name: string;
  birth_date: Date;
  phone_number?: string;
}

export interface TeacherEntity {
  id: number;
  name: string;
  birth_date: Date;
  phone_number?: string;
}


export function convertToStudent(
  entity: StudentEntity,
  schedules: StudentClassSchedule[]
): Student {
  return {
    id: entity.id,
    name: entity.name,
    birth_date: entity.birth_date,
    phone_number: entity.phone_number,
    schedules: schedules.map(schedule => ({
      class_type: schedule.class_type,
      day_of_week: schedule.day_of_week
    }))
  };
}

export function convertToTeacher(
  entity: TeacherEntity,
  schedules: TeacherClassSchedule[]
): Teacher {
  return {
    id: entity.id,
    name: entity.name,
    birth_date: entity.birth_date,
    phone_number: entity.phone_number,
    schedules: schedules.map(schedule => ({
      class_type: schedule.class_type,
      day_of_week: schedule.day_of_week
    }))
  };
}

