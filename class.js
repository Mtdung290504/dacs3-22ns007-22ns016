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
            const { class_name, member_count } = await db.getClassNameAndMember(
                classId
            );
            const listOfClasses = await db.getAllClass(user.id, role);

            if (role == 1) {
                const listOfAttachFile = await db.getClassAttachFiles(classId, user.id);
                res.render("class-views/lecturer", {
                    rootUrl,
                    user,
                    role: roles[role],
                    listOfAttachFile,
                    listOfClasses,
                    className: class_name,
                    members: member_count
                });
                // console.log({
                //     classId,
                //     role,
                //     className: class_name,
                //     members: member_count,
                //     listOfAttachFile,
                // });
                return;
            }
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
