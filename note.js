/*
Việc tạo một thư mục lưu trữ riêng cho mỗi người dùng là một cách tiếp cận phổ biến và hiệu quả để giải quyết vấn đề trùng tên file và bảo mật dữ liệu. 
Khi bạn tạo một thư mục con dựa trên định danh duy nhất của người dùng (ví dụ: ID người dùng), bạn có thể lưu tất cả các file của họ trong thư mục này, giữ cho dữ liệu của họ riêng tư và tránh trùng tên file.
Dưới đây là cách bạn có thể thực hiện điều này:

1. Tạo thư mục lưu trữ cho mỗi người dùng: Khi một người dùng đăng ký, bạn có thể tự động tạo một thư mục riêng cho họ trên server:
*/

const fs = require('fs');
const path = require('path');

function createUserDir(userId) {
    const userDir = path.join('uploads', String(userId));

    // Kiểm tra nếu thư mục chưa tồn tại thì tạo mới
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
    }

    return userDir;
}

/*2. Cấu hình multer để lưu file vào thư mục của người dùng: */
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = createUserDir(req.user.id); // Giả sử bạn đã xác thực và có req.user.id
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

/*
Trong đoạn mã trên, chúng ta sử dụng createUserDir để tạo thư mục lưu trữ cho người dùng và cấu hình multer để lưu file vào thư mục này.
3. Đảm bảo tính riêng tư: Việc này không chỉ giúp tránh xung đột tên file mà còn giúp bảo vệ tính riêng tư và an ninh cho dữ liệu của mỗi người dùng. 
Khi bạn muốn truy cập file của một người dùng cụ thể, bạn chỉ cần biết đường dẫn đến thư mục của họ và tên file, mà không cần phải lo lắng về việc trùng tên file hoặc xung đột định danh.
4. Xóa thư mục khi không cần thiết:Nếu một người dùng xóa tài khoản của họ, bạn có thể xóa thư mục lưu trữ của họ để giải phóng không gian lưu trữ:
*/
function deleteUserDir(userId) {
    const userDir = path.join('uploads', String(userId));

    // Xóa thư mục nếu tồn tại
    if (fs.existsSync(userDir)) {
        fs.rmdirSync(userDir, { recursive: true });
    }
}
