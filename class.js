const router = require("express").Router();
const middleWares = require("./middle-wares");
const Database = require("./model/database/database");
const Utils = require("./utils");
const db = new Database();

router.get(
    "/:id",
    middleWares.requireClassExistence,
    middleWares.requireAccessToClass,
    async (req, res) => {
        const classId = req.params.id;
        const user = req.session.user;
        user.accessingClass = classId;
        const role = req.session.role;
        const roles = ["SV", "GV"];
        const rootUrl = Utils.getRootUrl(req);

        try {
            const { class_name, member_count } = await db.getClassNameAndMember(classId);
            const listOfClasses = await db.getAllClass(user.id, role);
            const listOfExerciseIds = await db.getExerciseIds(classId);

            if (role == 1) {
                const listOfAttachFile = await db.getClassAttachFiles(classId, user.id);
                // Mảng promises chứa các promise để lấy thông tin của từng bài tập
                const promises = listOfExerciseIds.map(({ id }) => {
                    const exerciseId = id;
                    return Promise.all([
                        db.getExerciseInfoForLecturer(exerciseId),
                        db.getAttachFileOfExercise(exerciseId)
                    ]).then(([exerciseInfo, attachFiles]) => {
                        if (exerciseInfo) {
                            exerciseInfo.attachFiles = attachFiles;
                            return exerciseInfo;
                        }
                        return null;
                    });
                });
                
                const exercises = await Promise.all(promises); // Đợi cho tất cả các promise hoàn thành và lấy kết quả
                const validExercises = exercises.filter(exercise => exercise !== null); // Lọc
                validExercises.sort((a, b) => a.id - b.id); // Xếp
                exercises.forEach(exercise => {
                    exercise.start_time = Utils.formatToDisplayDatetime(exercise.start_time);
                    exercise.end_time = Utils.formatToDisplayDatetime(exercise.end_time);
                });

                res.render("class-views/lecturer", {
                    rootUrl, user,
                    role: roles[role],
                    listOfAttachFile,
                    listOfClasses,
                    className: class_name,
                    members: member_count,
                    exercises
                });
                return;
            }

            const lecturerId = listOfClasses[listOfClasses.findIndex(cls => cls.id == classId)]['lecturer_id'];
            const listOfAttachFile = await db.getClassAttachFiles(classId, lecturerId);
            res.render("class-views/student", {
                rootUrl, user,
                role: roles[role],
                listOfAttachFile,
                listOfClasses,
                className: class_name,
                members: member_count
            });
        } catch (error) {
            console.error(error);
            res.send("Internal server error");
        }
    }
);

router.get("/another-route", (req, res) => {
    // router code here
});

module.exports = router;
