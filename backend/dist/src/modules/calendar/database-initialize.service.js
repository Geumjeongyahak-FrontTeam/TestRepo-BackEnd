"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var DatabaseInitializerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseInitializerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const date_fns_1 = require("date-fns");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const person_entity_1 = require("../../entities/person.entity");
const calendar_entity_1 = require("../../entities/calendar/calendar.entity");
const calendar_description_entity_1 = require("../../entities/calendar/calendar-description.entity");
const class_interface_1 = require("../../libs/interface/shared/class.interface");
const calendar_interface_1 = require("../../libs/interface/calendar.interface");
let DatabaseInitializerService = DatabaseInitializerService_1 = class DatabaseInitializerService {
    constructor(teacherRepository, studentRepository, teacherScheduleRepository, studentScheduleRepository, calendarEventRepository, calendarEventTeacherRepository, calendarEventStudentRepository, studentAttendanceRepository, teacherAttendanceRepository, connection) {
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.teacherScheduleRepository = teacherScheduleRepository;
        this.studentScheduleRepository = studentScheduleRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.calendarEventTeacherRepository = calendarEventTeacherRepository;
        this.calendarEventStudentRepository = calendarEventStudentRepository;
        this.studentAttendanceRepository = studentAttendanceRepository;
        this.teacherAttendanceRepository = teacherAttendanceRepository;
        this.connection = connection;
        this.logger = new common_1.Logger(DatabaseInitializerService_1.name);
    }
    async onModuleInit() {
        const teacherCount = await this.teacherRepository.count();
        if (teacherCount === 0) {
            this.logger.log('Initializing database with teacher and student data...');
            await this.initializeData();
            await this.generateLessonEvents();
        }
        else {
            this.logger.log('Database already initialized. Skipping initialization.');
        }
    }
    async initializeData() {
        try {
            const filePath = path.join(process.cwd(), 'data', 'initial-data.json');
            const dataBuffer = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(dataBuffer);
            // Init Data
            for (const teacherData of data.teachers) {
                const { schedules } = teacherData, teacherInfo = __rest(teacherData, ["schedules"]);
                const now = new Date();
                const teacher = await this.teacherRepository.save(Object.assign(Object.assign({}, teacherInfo), { started_at: now, finished_at: now }));
                const scheduleEntities = schedules.map(schedule => (Object.assign({ teacher_id: teacher.id }, schedule)));
                await this.teacherScheduleRepository.save(scheduleEntities);
            }
            for (const studentData of data.students) {
                const { schedules } = studentData, studentInfo = __rest(studentData, ["schedules"]);
                const now = new Date();
                const student = await this.studentRepository.save(Object.assign(Object.assign({}, studentInfo), { started_at: now, finished_at: now }));
                const scheduleEntities = schedules.map(schedule => (Object.assign({ student_id: student.id }, schedule)));
                await this.studentScheduleRepository.save(scheduleEntities);
            }
            this.logger.log('Teachers and students data initialized successfully.');
        }
        catch (error) {
            this.logger.error('Failed to initialize teacher/student data', error);
            throw error;
        }
    }
    async generateLessonEvents() {
        const now = new Date();
        const startDate = (0, date_fns_1.startOfMonth)((0, date_fns_1.addMonths)(now, -1));
        const endDate = (0, date_fns_1.endOfMonth)((0, date_fns_1.addMonths)(now, 1));
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const days = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
            for (const day of days) {
                const dayOfWeek = day.getDay();
                const teacherSchedules = await this.teacherScheduleRepository.find({
                    where: { day_of_week: dayOfWeek },
                    relations: ['teacher']
                });
                await Promise.all(teacherSchedules.map(async (schedule) => {
                    const event = new calendar_entity_1.CalendarEventEntity();
                    event.event_type = calendar_interface_1.EventType.CLASS;
                    event.class_type = schedule.class_type;
                    event.event_date = day;
                    event.is_recurring = false;
                    event.created_at = now;
                    event.updated_at = now;
                    const description = new calendar_description_entity_1.CalendarEventDescriptionEntity();
                    description.description = `${schedule.class_type} class`;
                    event.description = description;
                    const savedEvent = await queryRunner.manager.save(event);
                    const eventTeacher = new calendar_entity_1.CalendarEventTeacherEntity();
                    eventTeacher.teacher_id = schedule.teacher_id;
                    eventTeacher.event = savedEvent;
                    await queryRunner.manager.save(eventTeacher);
                    const teacherAttendance = new person_entity_1.TeacherAttendanceEntity();
                    teacherAttendance.teacher_id = schedule.teacher_id;
                    teacherAttendance.event = savedEvent;
                    teacherAttendance.status = class_interface_1.AttendanceStatus.UNASSIGNED;
                    teacherAttendance.event_type = calendar_interface_1.EventType.CLASS;
                    await queryRunner.manager.save(teacherAttendance);
                    const studentSchedules = await this.studentScheduleRepository.find({
                        where: {
                            class_type: schedule.class_type,
                            day_of_week: dayOfWeek
                        },
                        relations: ['student']
                    });
                    await Promise.all(studentSchedules.map(async (studentSchedule) => {
                        const eventStudent = new calendar_entity_1.CalendarEventStudentEntity();
                        eventStudent.student_id = studentSchedule.student_id;
                        eventStudent.event = savedEvent;
                        await queryRunner.manager.save(eventStudent);
                        const studentAttendance = new person_entity_1.StudentAttendanceEntity();
                        studentAttendance.student_id = studentSchedule.student_id;
                        studentAttendance.event = savedEvent;
                        studentAttendance.status = class_interface_1.AttendanceStatus.UNASSIGNED;
                        studentAttendance.class_type = schedule.class_type;
                        return queryRunner.manager.save(studentAttendance);
                    }));
                }));
            }
            await queryRunner.commitTransaction();
            this.logger.log('Lesson events generated successfully.');
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Failed to generate lesson events', error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
DatabaseInitializerService = DatabaseInitializerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(person_entity_1.TeacherEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(person_entity_1.StudentEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(person_entity_1.TeacherClassScheduleEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(person_entity_1.StudentClassScheduleEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventTeacherEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventStudentEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(person_entity_1.StudentAttendanceEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(person_entity_1.TeacherAttendanceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Connection])
], DatabaseInitializerService);
exports.DatabaseInitializerService = DatabaseInitializerService;
