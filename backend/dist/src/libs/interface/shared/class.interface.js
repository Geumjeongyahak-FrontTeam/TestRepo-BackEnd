"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceStatus = exports.getClassTypesForDay = exports.getDayType = exports.ClassScheduleConfig = exports.ClassTypeNames = exports.ClassType = void 0;
// --------------------- About Class Types --------------------------
var ClassType;
(function (ClassType) {
    ClassType["DAISY"] = "DAISY";
    ClassType["DANDELION"] = "DANDELION";
    ClassType["ROSE"] = "ROSE";
    ClassType["SUNFLOWER"] = "SUNFLOWER";
    ClassType["CHRYSANTHEMUM"] = "CHRYSANTHEMUM";
    ClassType["CAMELLIA"] = "CAMELLIA";
    ClassType["SPROUT1"] = "SPROUT1";
    ClassType["SPROUT2"] = "SPROUT2";
    ClassType["TREE1"] = "TREE1";
    ClassType["TREE2"] = "TREE2";
    ClassType["FRUIT"] = "FRUIT";
    ClassType["SMARTPHONE"] = "SMARTPHONE";
    ClassType["UNKNWON"] = "UNKNWON"; // 미정
})(ClassType = exports.ClassType || (exports.ClassType = {}));
exports.ClassTypeNames = {
    [ClassType.DAISY]: '개나리반',
    [ClassType.DANDELION]: '민들레반',
    [ClassType.ROSE]: '장미반',
    [ClassType.SUNFLOWER]: '해바라기반',
    [ClassType.CHRYSANTHEMUM]: '국화반',
    [ClassType.CAMELLIA]: '동백반',
    [ClassType.SPROUT1]: '새싹1반',
    [ClassType.SPROUT2]: '새싹2반',
    [ClassType.TREE1]: '나무1반',
    [ClassType.TREE2]: '나무2반',
    [ClassType.FRUIT]: '열매반',
    [ClassType.SMARTPHONE]: '스마트폰반',
    [ClassType.UNKNWON]: '미정'
};
exports.ClassScheduleConfig = {
    weekday: [
        ClassType.DAISY,
        ClassType.DANDELION,
        ClassType.ROSE,
        ClassType.SUNFLOWER,
        ClassType.CHRYSANTHEMUM,
        ClassType.CAMELLIA
    ],
    weekend: [
        ClassType.SPROUT1,
        ClassType.SPROUT2,
        ClassType.TREE1,
        ClassType.TREE2,
        ClassType.FRUIT,
        ClassType.SMARTPHONE
    ]
};
function getDayType(dayOfWeek) {
    if (dayOfWeek === 0)
        return 'sunday';
    if (dayOfWeek === 6)
        return 'weekend';
    return 'weekday';
}
exports.getDayType = getDayType;
function getClassTypesForDay(dayOfWeek) {
    const dayType = getDayType(dayOfWeek);
    if (dayType === 'sunday')
        return [];
    return exports.ClassScheduleConfig[dayType];
}
exports.getClassTypesForDay = getClassTypesForDay;
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "PRESENT";
    AttendanceStatus["ABSENT"] = "ABSENT";
    AttendanceStatus["LATE"] = "LATE";
    AttendanceStatus["EXCUSED"] = "EXCUSED";
    AttendanceStatus["CANCELLED"] = "CANCELLED";
    AttendanceStatus["UNASSIGNED"] = "UNASSIGNED";
})(AttendanceStatus = exports.AttendanceStatus || (exports.AttendanceStatus = {}));
