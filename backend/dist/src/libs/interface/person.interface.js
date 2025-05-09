"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToTeacher = exports.convertToStudent = void 0;
function convertToStudent(entity, schedules) {
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
exports.convertToStudent = convertToStudent;
function convertToTeacher(entity, schedules) {
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
exports.convertToTeacher = convertToTeacher;
