const router = require('express').Router()
const middleWares = require('./middle-wares');
const Database = require("./model/database/database");
const db = new Database();

router.get('/:id', middleWares.requireClassExistence, middleWares.requireAccessToClass, async (req , res)=>{
    const classId = req.params.id;
    const userId = req.params.id;
    const role = req.session.role;

    const { class_name, member_count } = await db.getClassNameAndMember(classId);
    
    if (role == 1) {
        const listOfAttachFile = await db.getClassAttachFiles(classId, userId);
        res.json({ classId, role, className: class_name, members: member_count, listOfAttachFile });
        return;
    }
    
});


router.get('/another-route' , (req , res)=>{
    // router code here
})

module.exports  = router