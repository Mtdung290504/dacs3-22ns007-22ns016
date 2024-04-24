const database = {
    users: {
        uid: 'char(36)',
        isTeacher: 'tinyint',
        userName: 'nvarchar(50)',
        phoneNumber: 'char(10)',
        email: 'varchar(100)',
        password: 'varchar(100)'
    },

    //Đồng bộ các tài khoản của user (1 user có thể login bằng mã sv, sđt hoặc mã gì đó)
    //Truy vấn sẽ innerjoin 2 bảng
        loginIds: {
            uid: 'char(36) foreign key -> users.uid',
            loginId: 'varchar(36)'
        },
    
    class: {
        id: 'int',
        name: 'nvarchar(100)',
        teacherId: 'char(36) foreign key -> users.uid'
    },
    //Các chia nhóm trong class
        groups: {
            id: 'int',
            name: 'nvarchar(100)',
            classId: 'int foreign key -> class.id'
        },
        subgroups: {
            id: 'int',
            name: 'nvarchar(100)',
            groupId: 'int foreign key -> groups.id'
        },
        members: {
            uid: 'char(36) foreign key -> users.uid',
            subgroupId: 'int foreign key -> subgroups.id'
        },
        subGroupMessages: {
            id: 'int',
            senderId: 'char(36) foreign key -> users.uid',
            subGroupId: 'int foreign key -> subgroups',
            content: 'text',
            attachFile: 'nvarchar(100)',
            sendTime: 'timestamp'
        },

    //Các bài tập/kiểm tra trong class
        
    //Kho tài liệu
        questCategory: {
            id: 'int',
            name: 'nvarchar(50)'
        },
        docCategory: {
            id: 'int',
            name: 'nvarchar(50)'            
        },
        
        quests: {
            id: 'int',
            categoryId: 'int foreign key -> questCategory.id',
            questContent: 'text'
        },
        questOptions: {
            id: 'int',
            questId: 'int foreign key -> quests.id',
            optionContent: 'text',
            right: 'tinyint'
        }
}